export interface Env {
  AI: any;
  BUCKET: R2Bucket;
  EDGE_SECRET?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Edge-Secret',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function errorJson(message: string, status = 400): Response {
  return json({ error: message }, status);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Health check
    if (path === '/' || path === '/api/edge/health') {
      return json({ status: 'ok', service: 'oob-edge-worker', time: new Date().toISOString() });
    }

    // Serve artwork from R2
    if (request.method === 'GET' && path.startsWith('/api/edge/art/')) {
      const filename = path.replace('/api/edge/art/', '');
      if (!filename || filename.includes('..')) {
        return errorJson('Invalid filename', 400);
      }

      const key = `oob/art/${filename}`;
      const object = await env.BUCKET.get(key);
      if (!object) {
        return errorJson('Artwork not found', 404);
      }

      const headers = new Headers(CORS_HEADERS);
      headers.set('Content-Type', object.httpMetadata?.contentType || 'image/png');
      headers.set('Cache-Control', 'public, max-age=604800, immutable');
      headers.set('ETag', object.httpEtag);

      return new Response(object.body, { headers });
    }

    // Enhance chore into an epic quest with micro-steps and prompt
    if (request.method === 'POST' && path === '/api/edge/enhance-quest') {
      try {
        const body = (await request.json()) as { original?: string; genre?: string; lang?: string };
        const original = body.original?.trim() || 'A mysterious mundane task';
        const genre = body.genre || 'CLASSIC';
        const lang = body.lang || 'en';

        const systemPrompt = `You are the master quest designer for the "Opposite of Boring" multiplayer experience.
Your job is to transform a real, boring everyday chore into an epic, hilarious, and inspiring heroic quest.
The genre selected is: ${genre}.
Output strictly valid JSON with no markdown wrapping or extra commentary:
{
  "lore": "One dramatic sentence describing the heroic context of this task in ${lang === 'de' ? 'German' : 'English'}",
  "difficulty": "Rank E / D / C / B / A / S",
  "estimatedMinutes": 15,
  "microSteps": [
    "Step 1: First small, clear, actionable, fun sub-task",
    "Step 2: Second actionable sub-task",
    "Step 3: Victory lap final sub-task"
  ],
  "imagePrompt": "Detailed English visual description of this scene in ${genre} style, vibrant cinematic digital concept art"
}`;

        const userPrompt = `Boring chore: "${original}". Transform it now into valid JSON!`;

        let rawResponse = '';
        try {
          const aiResult = (await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 512,
          })) as { response?: string };

          rawResponse = aiResult.response || '';
        } catch (aiErr: any) {
          console.warn('AI run error:', aiErr);
          // Return structured fallback
          return json({
            lore: `The legend of ${original} begins across the realm.`,
            difficulty: 'Rank C',
            estimatedMinutes: 20,
            microSteps: [
              `Prepare the workspace for "${original}"`,
              `Engage in focused effort for 15 minutes`,
              `Celebrate the triumphant completion!`,
            ],
            imagePrompt: `A magnificent cinematic scene depicting the epic completion of ${original} in ${genre} style, digital art`,
          });
        }

        // Parse JSON from response
        try {
          const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return json(parsed);
          }
        } catch (e) {
          console.warn('JSON parse failure, falling back to heuristic parsing');
        }

        return json({
          lore: `The quest to conquer "${original}" has arrived.`,
          difficulty: 'Rank C',
          estimatedMinutes: 15,
          microSteps: [
            `Initialize the first step of ${original}`,
            `Execute the core ritual`,
            `Seal the glorious victory`,
          ],
          imagePrompt: `An epic concept illustration of ${original} in style ${genre}`,
        });
      } catch (err: any) {
        return errorJson(err.message || 'Quest enhancement failed', 500);
      }
    }

    // Generate artwork and store into R2
    if (request.method === 'POST' && path === '/api/edge/generate-art') {
      try {
        const body = (await request.json()) as { prompt?: string; id?: string | number };
        const prompt = body.prompt?.trim() || 'A legendary golden artifact surrounded by glowing celestial energy';
        const id = body.id || Date.now();
        const filename = `${id}-${Date.now()}.png`;
        const key = `oob/art/${filename}`;

        let imageBuffer: ArrayBuffer | Uint8Array | null = null;
        try {
          const imageResult = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
            prompt,
            steps: 4,
          });

          if (imageResult instanceof ReadableStream) {
            imageBuffer = await new Response(imageResult).arrayBuffer();
          } else if (imageResult?.image) {
            // Base64 string fallback
            const binary = atob(imageResult.image);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            imageBuffer = bytes.buffer;
          } else if (imageResult instanceof ArrayBuffer || imageResult instanceof Uint8Array) {
            imageBuffer = imageResult;
          }
        } catch (aiErr: any) {
          console.warn('Flux image generation error:', aiErr);
          return errorJson('Image generation failed: ' + (aiErr.message || 'AI error'), 502);
        }

        if (!imageBuffer) {
          return errorJson('No image output received from AI', 502);
        }

        // Store into R2
        await env.BUCKET.put(key, imageBuffer, {
          httpMetadata: {
            contentType: 'image/png',
          },
        });

        const urlPath = `/api/edge/art/${filename}`;
        return json({
          success: true,
          key,
          filename,
          url: urlPath,
        });
      } catch (err: any) {
        return errorJson(err.message || 'Artwork generation failed', 500);
      }
    }

    return errorJson('Not found', 404);
  },
};

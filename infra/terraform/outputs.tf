output "site_url" {
  description = "Production URL of the app."
  value       = local.site_url
}

output "repositories" {
  description = "Web URL of each managed repository."
  value       = { for key, repo in github_repository.this : key => repo.html_url }
}

output "vercel_project_id" {
  description = "ID of the Vercel project that deploys the umbrella repository."
  value       = vercel_project.app.id
}

# Credentials come from the environment, never from files in this repo:
#   GITHUB_TOKEN      (e.g. `export GITHUB_TOKEN=$(gh auth token)`)
#   VERCEL_API_TOKEN  (a token from https://vercel.com/account/tokens)

provider "github" {
  owner = var.github_owner
}

provider "vercel" {
  team = var.vercel_team
}

terraform {
  required_version = ">= 1.10"

  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.13"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 5.26"
    }
  }
}

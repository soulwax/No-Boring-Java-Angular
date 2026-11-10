locals {
  site_url = "https://no-boring-java-angular.vercel.app"
  topics   = ["spring-boot", "angular", "server-sent-events", "signals", "showcase"]

  # The umbrella repo pins the other two as submodules. `checks` are the CI job names
  # that must pass before a pull request can merge.
  repositories = {
    umbrella = {
      name        = "No-Boring-Java-Angular"
      description = "Opposite of Boring: a live Spring Boot 4 + Angular 22 showcase. Submodules, Docker Compose, CI and Terraform."
      topics      = concat(local.topics, ["docker-compose", "terraform", "vercel"])
      checks      = ["Compose stack", "Terraform"]
    }
    backend = {
      name        = "No-Boring-Backend"
      description = "Spring Boot 4 backend for Opposite of Boring: domain events, SSE, scheduled entropy and Problem Details."
      topics      = concat(local.topics, ["java", "spring-data-jpa"])
      checks      = ["Test", "Image"]
    }
    frontend = {
      name        = "No-Boring-Frontend"
      description = "Zoneless Angular 22 frontend for Opposite of Boring: a signal store over SSE with a hand-built design system."
      topics      = concat(local.topics, ["typescript", "design-system"])
      checks      = ["Test", "Image"]
    }
  }
}

resource "github_repository" "this" {
  for_each = local.repositories

  name         = each.value.name
  description  = each.value.description
  homepage_url = local.site_url
  topics       = each.value.topics
  visibility   = "public"

  has_issues      = true
  has_projects    = false
  has_wiki        = false
  has_discussions = false

  # Linear history: squash or rebase, never merge commits
  allow_merge_commit     = false
  allow_squash_merge     = true
  allow_rebase_merge     = true
  delete_branch_on_merge = true

  # A destroy archives the repository instead of deleting it
  archive_on_destroy = true

  lifecycle {
    prevent_destroy = true
  }
}

resource "github_repository_vulnerability_alerts" "this" {
  for_each = local.repositories

  repository = github_repository.this[each.key].name
  enabled    = true
}

resource "github_branch_protection" "main" {
  for_each = local.repositories

  repository_id = github_repository.this[each.key].node_id
  pattern       = "main"

  require_signed_commits  = true
  required_linear_history = true
  allows_force_pushes     = false
  allows_deletions        = false
  # The owner may still push signed commits straight to main; everyone else goes through CI
  enforce_admins = false

  required_status_checks {
    strict   = false
    contexts = each.value.checks
  }
}

resource "vercel_project" "app" {
  name = "no-boring-java-angular"
  # Builds the frontend and the backend container from the `services` block in vercel.json
  framework = "services"

  resource_config = {
    fluid                    = true
    function_default_regions = ["iad1"]
  }

  git_repository = {
    type              = "github"
    repo              = "${var.github_owner}/${local.repositories.umbrella.name}"
    production_branch = "main"
  }

  lifecycle {
    prevent_destroy = true
  }
}

# Everything here already existed before Terraform did. These blocks adopt it into state on the
# first apply instead of trying to create duplicates. They are harmless once imported.

import {
  for_each = local.repositories
  to       = github_repository.this[each.key]
  id       = each.value.name
}

import {
  to = vercel_project.app
  id = var.vercel_project_id
}

variable "github_owner" {
  description = "GitHub user or organization that owns the three repositories."
  type        = string
  default     = "soulwax"
}

variable "vercel_team" {
  description = "Vercel team slug or ID the project lives in."
  type        = string
  default     = "cirrusokimasu"
}

variable "vercel_project_id" {
  description = "ID of the existing Vercel project, adopted by the import block in imports.tf."
  type        = string
  default     = "prj_KphHRRLmGFVoUYIzZSWL0IrJDrGd"
}

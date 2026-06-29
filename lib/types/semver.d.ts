declare module "semver" {
  export interface Options {
    includePrerelease?: boolean
    loose?: boolean
  }

  export function satisfies(
    version: string,
    range: string,
    options?: Options,
  ): boolean
}

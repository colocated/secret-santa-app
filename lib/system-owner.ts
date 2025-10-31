import { nanoid } from "nanoid"

export function generateSystemOwnerCode(): string {
  return nanoid(16).toUpperCase()
}

export async function getOrCreateSystemOwnerCode(): Promise<string> {
  // This will be stored in the database
  // For now, return a generated code
  return generateSystemOwnerCode()
}

export function logSystemOwnerCode(code: string): void {
  console.log("\n" + "=".repeat(60))
  console.log("🎄 SECRET SANTA - SYSTEM OWNER CODE 🎄")
  console.log("=".repeat(60))
  console.log("\nYour system owner code is:")
  console.log(`\n  ${code}\n`)
  console.log("Use this code to claim ownership of the Secret Santa app.")
  console.log("This code will only be shown once in the console.")
  console.log("=".repeat(60) + "\n")
}

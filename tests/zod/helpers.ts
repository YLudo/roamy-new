import { z } from "zod";

/** Affiche joliment les erreurs Zod dans les logs de test */
function prettyIssues(error: z.ZodError) {
  const lines = error.issues.map(i => {
    const path = i.path.length ? i.path.join(".") : "(root)";
    return `• ${path}: ${i.code} – ${i.message}`;
  });
  return lines.join("\n");
}

/** Vérifie que le parse est OK, sinon imprime les erreurs et échoue le test */
export function expectOk<TInput, TOutput>(
  result: z.SafeParseReturnType<TInput, TOutput>
): asserts result is z.SafeParseSuccess<TOutput> {
  if (!result.success) {
    // aide au debuggage
    // eslint-disable-next-line no-console
    console.error("Zod parse failed:\n" + prettyIssues(result.error));
  }
  expect(result.success).toBe(true);
  // si on arrive ici, TS sait que c'est SafeParseSuccess
  expect(result.data).toBeDefined();
}

/**
 * Vérifie que le parse échoue et qu'au moins un des checks correspond.
 * Chaque check peut préciser path/code/substring du message.
 */
export function expectFail<TInput, TOutput>(
  result: z.SafeParseReturnType<TInput, TOutput>,
  checks: Array<{
    path?: (string | number)[];
    code?: z.ZodIssue["code"];
    messageIncludes?: string;
  }> = []
): asserts result is z.SafeParseError<TInput> {
  if (result.success) {
    // eslint-disable-next-line no-console
    console.error("Zod parse unexpectedly succeeded with data:", result.data);
  }
  expect(result.success).toBe(false);

  const issues = result.success ? [] : result.error.issues;

  if (checks.length === 0) {
    expect(issues.length).toBeGreaterThan(0);
    return;
  }

  for (const check of checks) {
    const hit = issues.find(i => {
      const pathOk =
        !check.path || JSON.stringify(i.path) === JSON.stringify(check.path);
      const codeOk = !check.code || i.code === check.code;
      const msgOk =
        !check.messageIncludes || i.message.includes(check.messageIncludes);
      return pathOk && codeOk && msgOk;
    });

    if (!hit) {
      // eslint-disable-next-line no-console
      console.error(
        "No issue matched:",
        check,
        "\nAll issues were:\n" + issues.map(i => ({
          path: i.path,
          code: i.code,
          message: i.message
        })).map(o => JSON.stringify(o)).join("\n")
      );
    }
    expect(hit).toBeDefined();
  }
}

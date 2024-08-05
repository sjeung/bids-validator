import { main } from './main.ts'

const result = await main()

let errors = result.issues.get({severity: 'error'})
if (errors.length) {
    Deno.exit(1)
}

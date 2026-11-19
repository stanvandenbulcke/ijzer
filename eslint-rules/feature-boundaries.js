// Local ESLint rule: a feature (= a tab or flow in src/features/<name>) never imports from
// another feature. Shared code belongs in src/domain, src/data or src/ui (SPEC §3.2).
// Catches relative imports too ("../../today/x"), which a plain pattern rule cannot.
import path from 'node:path'

const featureOf = (file) => {
  const match = file
    .split(path.sep)
    .join('/')
    .match(/\/src\/features\/([^/]+)\//)
  return match ? match[1] : null
}

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow imports between features' },
    messages: {
      crossFeature:
        'Feature "{{from}}" may not import from feature "{{to}}". Move shared code to src/domain, src/data or src/ui.',
    },
    schema: [],
  },
  create(context) {
    const own = featureOf(context.filename)
    if (!own) return {}
    return {
      ImportDeclaration(node) {
        const spec = node.source.value
        if (typeof spec !== 'string' || !spec.startsWith('.')) return
        const target = featureOf(path.resolve(path.dirname(context.filename), spec) + '/')
        if (target && target !== own) {
          context.report({ node, messageId: 'crossFeature', data: { from: own, to: target } })
        }
      },
    }
  },
}

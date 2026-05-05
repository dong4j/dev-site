import getReadingTime from 'reading-time'
import { toString } from 'mdast-util-to-string'
import { visit } from 'unist-util-visit'

export function remarkReadingTime() {
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    return function (tree, { data }) {
        const textOnPage = toString(tree)
        const readingTime = getReadingTime(textOnPage)

        data.astro.frontmatter.minutesRead = readingTime.text
    }
}

function escapeHtml(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll('\'', '&#39;')
}

export function remarkMermaid() {
    return function (tree: any) {
        visit(tree, 'code', (node: any, index: number | undefined, parent: any) => {
            if (node.lang !== 'mermaid' || typeof index !== 'number' || !parent) {
                return
            }

            // Mermaid 代码块必须绕过 Shiki，否则会被渲染成普通高亮代码，客户端无法接管绘图。
            parent.children[index] = {
                type: 'html',
                value: `<pre class="mermaid">${escapeHtml(node.value)}</pre>`,
            }
        })
    }
}

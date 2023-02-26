async function doConvert() {
    const turndownService = new TurndownService({codeBlockStyle: 'fenced'});
    turndownService.addRule("fencedCodeBlock", {
        filter: function (node, options) {
            return node.nodeName === 'CODE';
        },

        replacement: function (content, node, options) {
            var className = node.getAttribute('class') || '';
            var language = (className.match(/language-(\S+)/) || [null, ''])[1];
            var code = node.textContent;

            if(language){
                return (
                    '\n\n' + '```' + language + '\n' +
                    code.replace(/\n$/, '') +
                    '\n' + '```' + '\n\n'
                );
            }

            return ('```' + code + '```' );
        }

    });

    function convertMarkDown(html) {
        try {
            let content = turndownService.turndown(html.replace(/Copy code/g, ''));
            content = content
                .replace(/Copy code/g, '')
                .replace(/This content may violate our content policy. If you believe this to be in error, please submit your feedback — your input will aid our research in this area./g, '')
                .trim();
            return content;
        } catch (e) {
            console.log(e);
        }
    }

    const qAndA = document.querySelectorAll(".text-base");
    let markdownContent = "";
    for (const qOrA of qAndA) {
        qOrA.querySelector(".whitespace-pre-wrap")
        && (markdownContent += `**${qOrA.querySelector('img')
            ? '我' : 'ChatGPT'}**:${convertMarkDown(qOrA
            .querySelector(".whitespace-pre-wrap").innerHTML)}\n\n`);
    }

    const url = URL.createObjectURL(new Blob([markdownContent]));
    let aEl = document.querySelectorAll("a.rounded-md.cursor-pointer.bg-gray-800");
    const aTag = document.createElement("a");

    aTag.download = aEl[0].innerText + ".md";
    aTag.href = url;
    aTag.style.display = "none";
    document.body.appendChild(aTag);
    aTag.click();
    URL.revokeObjectURL(url);
    aTag.remove();
}

chrome.action.onClicked.addListener(async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const [body] = await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: doConvert
    });
});

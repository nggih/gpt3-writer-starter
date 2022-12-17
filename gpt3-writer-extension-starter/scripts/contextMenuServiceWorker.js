// New function here
// Setup our generate function
// Function to get + decode API key
const getKey = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["openai-key"], (result) => {
      if (result["openai-key"]) {
        const decodedKey = atob(result["openai-key"]);
        resolve(decodedKey);
      }
    });
  });
};

const sendMessage = (content) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log("tabs:", tabs);
    const activeTab = tabs[0].id;

    chrome.runtime.sendMessage(
      // activeTab,
      { message: "inject", content },
      (response) => {
        if (chrome.runtime.lastError) {
          console.log("error");
          setTimeout(sendMessage, 1000);
        } else {
          console.log("sendMessage.response:", response);
          if (response.status === "success") {
            console.log("injection success.");
          }
        }
      }
    );
  });
};

const generate = async (prompt) => {
  // Get your API key from storage
  const key = await getKey();
  const url = "https://api.openai.com/v1/completions";

  // Call completions endpoint
  const completionResponse = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 1250,
      temperature: 0.7,
    }),
  });

  // Select the top choice and send back
  const completion = await completionResponse.json();
  return completion.choices.pop();
};
const generateCompletionAction = async (info) => {
  try {
    // Send mesage with generating text (this will be like a loading indicator)
    sendMessage("generating...");
    // console.log("generating ...");
    const { selectionText } = info;
    // const basePromptPrefix = `
    //   Write me a detailed table of contents for a blog post with the title below.

    //   Title:
    //   `;

    // // Add this to call GPT-3
    // const baseCompletion = await generate(
    //   `${basePromptPrefix}${selectionText}`
    // );
    // // Add your second prompt here
    // const secondPrompt = `
    //   Take the table of contents and title of the blog post below and generate a blog post written in thwe style of Paul Graham. Make it feel like a story. Don't just list the points. Go deep into each one. Explain why.

    //   Title: ${selectionText}

    //   Table of Contents: ${baseCompletion.text}

    //   Blog Post:
    //   `;

    // // Call your second prompt
    // const secondPromptCompletion = await generate(secondPrompt);
    // // Let's see what we get!
    // console.log(baseCompletion.text);
    // console.log(secondPromptCompletion.text);
    // Send the output when we're all done
    // sendMessage(secondPromptCompletion.text);
    console.log("selectionText:", selectionText);
    sendMessage("selectionText");
  } catch (error) {
    console.log(error);
    // Add this here as well to see if we run into any errors!
    sendMessage(error.toString());
  }
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "context-run",
    title: "Generate blog post",
    contexts: ["selection"],
  });
});

// Add listener
chrome.contextMenus.onClicked.addListener(generateCompletionAction);

const insert = (content) => {
  // Find Calmly editor input section
  console.log("insert.content:", content);
  const elements = document.getElementsByClassName("droid");

  if (elements.length === 0) {
    return;
  }

  const element = elements[0];
  // Grab the first p tag so we can replace it with our injection
  const pToRemove = element.childNodes[0];
  pToRemove.remove();
  // Split content by \n
  const splitContent = content.split("\n");
  console.log("insert.splitContent:", splitContent);
  // Wrap in p tags
  splitContent.forEach((content) => {
    const p = document.createElement("p");

    if (content === "") {
      const br = document.createElement("br");
      p.appendChild(br);
    } else {
      p.textContent = content;
    }

    // Insert into HTML one at a time
    element.appendChild(p);
  });
  // Insert into HTML one at a time

  // On success return true
  return true;
};

chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    console.log("content.addListener.request:", request);
    console.log("content.addListener.sender:", sender);
    console.log(
      sender.tab
        ? "from a content script:" + sender.tab.url
        : "from the extension"
    );
    if (request.message === "inject") {
      const { content } = request;

      console.log(content);
      // Call this insert function
      const result = insert(content);

      // If something went wrong, send a failed status
      if (!result) {
        sendResponse({ status: "failed" });
      }

      sendResponse({ status: "success" });
    }
  }
);

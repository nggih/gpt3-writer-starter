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

// chrome.runtime.onConnect.addListener((port) => {
//   port.onMessage.addListener((msg) => {
//     console.log("onConnect.addListener.msg:", msg);
//   });
// });

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

const main = async () => {
  const response = await fetch("/findPage");
  const path = await response.text();

  if (path === "/ttt.html") {
    globalThis.location.href = path;
  }

  setTimeout(main, 2000);
};

globalThis.onload = main;

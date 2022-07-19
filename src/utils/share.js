const download_img = (canvasURL, filename) => {
  const fakeLink = window.document.createElement("a");
  fakeLink.style = "display:none;";
  fakeLink.download = `${filename}.png`;
  fakeLink.href = canvasURL;
  document.body.appendChild(fakeLink);
  fakeLink.click();
  document.body.removeChild(fakeLink);
  fakeLink.remove();
}

const can_share_img = (canvasBlob) => {
  if (canvasBlob === undefined) {
    return false;
  }
  const files = [new File([canvasBlob], '', {type: canvasBlob.type})];
  const shareData = {
    text: '',
    title: '',
    files,
  }
  if (navigator.canShare && navigator.canShare(shareData)) {
    return true;
  } else {
    console.warn('Sharing not supported', shareData);
    return false;
  }
}

const share_img = async (canvasBlob, filename, title, text) => {
  const files = [new File([canvasBlob], `${filename}.png`, {type: canvasBlob.type})];
  const shareData = {
    text: text,
    title: title,
    files,
  }
  if (navigator.canShare && navigator.canShare(shareData)) {
    await navigator.share(shareData);
  }
}

export { download_img, can_share_img, share_img };

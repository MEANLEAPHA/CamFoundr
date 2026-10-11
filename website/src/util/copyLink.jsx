import toast from "react-hot-toast";
const handleCopyLink = async (postId) => {
  try {
    const postUrl = `https://nahidea.com/aboutpost/${postId}`;
    await navigator.clipboard.writeText(postUrl);
    toast.success("Copied");
  } catch (err) {
    console.error(err);
    toast.error("Failed to copy link");
  }
};

export default handleCopyLink
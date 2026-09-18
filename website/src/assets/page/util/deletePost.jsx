import api from '../../api/axiosInstance';
import toast from "react-hot-toast";
const token = localStorage.getItem("token");

const handleDeletePost = async (postId) => {
  const confirmed = window.confirm(
        "Are you sure you want to delete this post? This can't be undone."
    );
  if (!confirmed) return;
  try {
    await api.delete(`/api/delete-post/${postId}`);
    toast.success("Post deleted successfully");
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete post");
  }
};

export default handleDeletePost;

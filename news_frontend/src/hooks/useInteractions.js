import { useState } from "react";
import { sendInteraction } from "../api/interactionApi";
import { useUserStore } from "../state/userStore";

export function useInteractions() {
  const user = useUserStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const trackInteraction = async ({
    article,
    topic,
    interactionType = "view",
    keywords,
  }) => {
    const userId =
      user?.user_id || localStorage.getItem("user_id") || "guest_user";

    // Backend expects non-empty keyword list
    const keywordList =
      keywords && keywords.length
        ? keywords
        : (article?.keywords || []);

    if (!article?.url) {
      setError("Article URL is missing");
      return;
    }

    const payload = {
      user_id: userId,
      article_id: article.article_id || article.url,
      topic: topic || article.topic || "general",
      keywords: keywordList.length ? keywordList : ["news"],
      interaction_type: interactionType,
    };

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Log the payload for debugging
      // eslint-disable-next-line no-console
      console.log("Sending interaction:", payload);
      
      const response = await sendInteraction(payload);
      
      // Show success message
      const actionNames = {
        like: "Liked",
        save: "Saved",
        dislike: "Disliked",
        read: "Read",
        view: "Viewed",
      };
      
      setSuccess(`${actionNames[interactionType] || "Recorded"} successfully!`);
      
      // Clear success message after 2 seconds
      setTimeout(() => setSuccess(null), 2000);
      
      return response;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Interaction error:", err);
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
      
      let errorMsg = "We couldn't record your interaction, but you can keep browsing.";
      
      if (err.response?.status === 404) {
        errorMsg = "Interaction endpoint not found. Please check if the backend is running.";
      } else if (err.response?.status === 400) {
        errorMsg = err.response?.data?.detail || "Invalid interaction data.";
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { trackInteraction, loading, error, success };
}



"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const CommentSection = ({ itemId, linkIdentifier }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");

  useEffect(() => {
    fetchComments();
  }, [itemId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `https://filmvaultbackend-2.onrender.com/comment${linkIdentifier}/${itemId}`
      );
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `https://filmvaultbackend-2.onrender.com/comment${linkIdentifier}/${itemId}`,
        {
          content: newComment,
          author: authorName || "Anonymous",
        }
      );
      setNewComment("");
      setAuthorName("");
      fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <div className="mt-12 lg:max-w-[60%] mx-auto">
      <h4 className="text-2xl font-bold text-gray-800 mb-4">Comments</h4>
      <form onSubmit={handleSubmitComment} className="mb-6">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your Name (optional)"
          className="w-full p-2 border rounded mb-2"
        />
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          placeholder="Write a comment..."
          rows="3"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
        >
          Post Comment
        </button>
      </form>
      <div>
        {comments.map((comment, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded mb-4">
            <p className="mb-2">{comment.content}</p>
            <p className="text-sm text-gray-600">
              By {comment.author} on{" "}
              {new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;

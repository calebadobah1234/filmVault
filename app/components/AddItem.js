"use client";
import React, { useReducer } from "react";

const reducer = (state, action) => {
  console.log(state, action);
  switch (action.type) {
    case "changeTitle":
      return { title: action.payload.title };
    case "changeDescription":
      return { description: action.payload.description };
    case "changeUrlToImage":
      return { urlToImage: action.payload.urlToImage };
    case "changeMainData":
      return { mainData: action.payload.changeMainData };
  }
  return state;
};

const handleSubmit = (e) => {
  e.preventdefault();
  console.log(state);
};

const AddItem = () => {
  const [state, dispatch] = useReducer(reducer, {
    title: "",
    description: "",
    urlToImage: "",
    mainData: "",
  });
  return (
    <>
      <div>
        <form
          action="http://localhost:3001/add-item"
          className="flex flex-col"
          onSubmit={handleSubmit}
          method="post"
        >
          <input
            name="title"
            placeholder="input title here"
            value={state.title}
            onChange={(e) => {
              dispatch({
                type: "changeTitle",
                payload: { title: e.target.value },
              });
            }}
            required
          ></input>
          <input
            name="description"
            placeholder="input description here"
            value={state.description}
            onChange={(e) => {
              dispatch({
                type: "changeDescription",
                payload: { description: e.target.value },
              });
            }}
            required
          ></input>

          <input
            name="urlToImage"
            placeholder="url to image"
            value={state.urlToImage}
            onChange={(e) => {
              dispatch({
                type: "changeUrlToImage",
                payload: { urlToImage: e.target.value },
              });
            }}
            required
          ></input>
          <input
            name="mainData"
            placeholder="input Main data here"
            value={state.mainData}
            onChange={(e) => {
              dispatch({
                type: "changeMainData",
                payload: { mainData: e.target.value },
              });
            }}
            required
          ></input>
          <input type="submit" />
        </form>
      </div>
    </>
  );
};

export default AddItem;

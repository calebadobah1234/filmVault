import React from "react";
import TopItems from "../../components/TopItems";

const page = ({ params }) => {
  return (
    <>
      <TopItems id={params.id} />
    </>
  );
};

export default page;

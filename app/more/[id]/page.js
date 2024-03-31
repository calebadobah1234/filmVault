import React from "react";
import Image from "next/image";
import RelatedContent from "@/app/components/RelatedContent";
import axios from "axios";

export const generateMetadata = async ({ params }) => {
  const res = await fetch(
    `https://byteread-final.onrender.com/get-item-details/${params.id}`,
    {
      next: { revalidate: 60 },
    }
  );
  const data = await res.json();
  return {
    title: `${data.title}`,
    description: `${data.description}`,
  };
};

const page = async ({ params }) => {
  const res = await fetch(
    `https://byteread-final.onrender.com/get-item-details/${params.id}`,
    { cache: "force-cache" }
  );
  const data = await res.json();
  const addViews = await axios.post(
    `https://byteread-final.onrender.com/add-views/${params.id}`
  );

  const filtered = data.mainData.filter((item) => {
    return !item.includes("RELATED", "MORE:\n");
  });
  return (
    <>
      <main className="flex justify-center mt-10">
        <div className="min-w-[80%] relative">
          <div className="bg-blue-800 rounded-2xl overflow-hidden ">
            <Image
              src={data.urlToImage}
              width={700}
              height={700}
              alt={data.title}
              className="w-full object-cover opacity-50 h-[450px]"
            />
          </div>
          <div className="absolute -bottom-10 left-10 overflow-hidden w-fill">
            <div className="flex">
              <Image
                src={data.urlToImage}
                width={200}
                height={300}
                alt={data.title}
                className="rounded-xl h-[250px]"
              />
              <div>
                <div className="text-white text-xl ml-8">
                  <p>Action|Drama|Intense Hentai</p>
                </div>
                <div className="ml-8">
                  <h1 className="text-white font-bold text-3xl">
                    {data.title}
                  </h1>
                </div>
                <div className="ml-8">
                  <p>
                    Synopsis:
                    <br />
                    In Gentlemen, we meet Eddie Halstead, an English aristocrat,
                    who inherits a great fortune after the death of his father.
                    But he soon discovers that his family is involved in illegal
                    activities. Eddie decides to stay out of this dark world,
                    but
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <aside>
        <RelatedContent title={data.title} />
      </aside>
    </>
  );
};

export default page;

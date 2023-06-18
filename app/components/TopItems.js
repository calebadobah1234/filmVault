import React from "react";
import Image from "next/image";
import TopTableOfContent from "./TopTableOfContent";

const TopItems = async (props) => {
  const res = await fetch(
    `https://byteread-final.onrender.com/get-item-details/${props.id}`,
    {
      next: {
        revalidate: 0,
      },
    }
  );
  const data = await res.json();
  console.log(data);
  return (
    <>
      <div className="grid grid-cols-5 mt-10">
        <div className="col-span-1 max-md:hidden"></div>
        <div className="col-span-3 max-md:col-span-5 ">
          <h1 className="font-sans text-3xl antialiased font-bold mb-4 max-w-3xl max-md:ml-2">
            {data.title}
          </h1>
          <div>
            <div className="max-md:h-auto h-[600px] overflow-hidden">
              <Image
                src={data.urlToImage}
                width={800}
                height={600}
                alt={data.title}
              />
            </div>
            <div>
              <h3 className="mt-10 font-sans text-2xl antialiased font-bold mb-4 max-w-3xl max-md:ml-2">
                Read Ahead:
              </h3>
              <TopTableOfContent data={data} />
            </div>
            <div>
              {data.entrys.map((item, index) => {
                return (
                  <>
                    <div>
                      <h2
                        id={index}
                        className="font-sans text-2xl antialiased font-bold mb-4 max-w-3xl max-md:ml-2"
                      >
                        {index + 1 + " " + item.title}
                      </h2>
                    </div>

                    <div className="max-md:h-auto h-96 overflow-hidden max-md:flex max-md:justify-center">
                      <Image
                        src={item.urlToImage}
                        width={600}
                        height={400}
                        alt={item.title}
                      />
                    </div>
                    <div className="mt-10 w-[80%] max-md:w-[94%] max-md:ml-2">
                      <p className="font-sans text-lg antialiased leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>
                  </>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopItems;

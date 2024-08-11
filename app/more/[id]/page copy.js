import React from "react";
import Image from "next/image";
import RelatedContent from "@/app/components/RelatedContent";
import axios from "axios";
import LatestItems from "@/app/components/LatestItems";

export const generateMetadata = async ({ params }) => {
  const res = await fetch(
    `http://localhost:3001/get-item-detailsS/${params.id}`,
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

let persianToEnglishCategories = {
  جنایی: "Crime",
  درام: "Drama",
  رازآلود: "Mystery",
  کمدی: "Comedy",
  اکشن: "Action",
  "علمی تخیلی": "Sci-Fi",
  ترسناک: "Horror",
  ماجراجویی: "Adventure",
  عاشقانه: "Romance",
  فانتزی: "Fantasy",
  مستند: "Documentary",
  کودکانه: "Children",
  تاریخی: "Historical",
  بایوگرافی: "Biography",
  وسترن: "Western",
  جنگی: "War",
  موزیکال: "Musical",
  ورزشی: "Sports",
  "سیاه و سفید": "Black and White",
  معمایی: "Mystery",
  خانوادگی: "Family",
  سیاسی: "Political",
  مذهبی: "Religious",
  "واقعیت افزوده": "Reality",
  مسابقه‌ای: "Game Show",
  گفتگویی: "Talk Show",
  کارتون: "Animation",
  تخیلی: "Fantasy",
  "محصولات انیمه": "Anime",
};
let categories = [
  "جنایی",
  "درام",
  "رازآلود",
  "کمدی",
  "اکشن",
  "علمی تخیلی",
  "ترسناک",
  "ماجراجویی",
  "عاشقانه",
  "فانتزی",
  "مستند",
  "کودکانه",
  "تاریخی",
  "بایوگرافی",
  "وسترن",
  "جنگی",
  "موزیکال",
  "ورزشی",
  "سیاه و سفید",
  "معمایی",
  "خانوادگی",
  "سیاسی",
  "مذهبی",
  "واقعیت افزوده",
  "مسابقه‌ای",
  "گفتگویی",
  "کارتون",
  "تخیلی",
  "محصولات انیمه",
];

const page = async ({ params }) => {
  const res = await fetch(
    `http://localhost:3001/get-item-detailsS/${params.id}`,
    {
      revalidate: 90000,
    }
  );
  const data = await res.json();
  const category1 =
    data.categories[0] && data.categories[0].replace("|", "").trim();
  const category2 =
    data.categories[1] && data.categories[1].replace("|", "").trim();
  const category3 =
    data.categories[2] && data.categories[2].replace("|", "").trim();

  const res9 = await axios.all([
    axios.get(`http://localhost:3001/get-related-contentS/${category1}`),
    axios.get(`http://localhost:3001/get-related-contentS/${category2}`),
    axios.get(`http://localhost:3001/get-related-contentS/${category3}`),
  ]);
  console.log(data.categories[0]);
  const [res1, res2, res3] = res9;
  const data1 = res1.data;
  const data2 = res2.data;
  const data3 = res3.data;
  const combinedData = [...data1, ...data2, ...data3];
  const uniqueDataMap = {};

  // Iterate over combinedData and store each object in uniqueDataMap based on its identifier
  combinedData.forEach((item) => {
    uniqueDataMap[item._id] = item;
  });

  // Extract unique objects from uniqueDataMap
  const uniqueCombinedData = Object.values(uniqueDataMap);

  // const addViews = await axios.post(
  //   `http://localhost:3001/get-item-detailsS/${params.id}`
  // );
  let image = data.img.split(",")[0];
  const modifiedImg = decodeURIComponent(
    image.replace("/_next/image?url=", "").split("&")[0]
  );
  const activeCategories = data.categories;

  return (
    <>
      <div>
        <main className=" mt-10 ">
          <div className="flex justify-end">
            {" "}
            <div className="min-w-[80%] relative">
              {/* <div className="bg-blue-800 rounded-2xl overflow-hidden ">
              <Image
                src={data.poster}
                width={1920}
                height={1080}
                alt={data.title}
                className="w-full object-cover opacity-50 h-[450px]"
              />
            </div> */}
              <div className=" overflow-hidden w-fill">
                <div className="flex">
                  <Image
                    src={modifiedImg}
                    width={200}
                    height={300}
                    alt={data.title}
                    className="rounded-xl"
                  />
                  <div>
                    <div className="text-white text-sm ml-8 flex">
                      {activeCategories.map((item, index) => {
                        return (
                          <div key={index} className="mr-2">
                            {
                              persianToEnglishCategories[
                                item.replace("|", "").trim()
                              ]
                            }
                            {index < activeCategories.length - 1 ? " |" : ""}
                          </div>
                        );
                      })}
                    </div>
                    <div className="ml-8">
                      <h1 className="text-white font-bold text-3xl">
                        {data.title}
                      </h1>
                    </div>
                    <div className="text-white ml-8 w-[50%]">
                      {data.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <div className="flex justify-center">
          <div className="mt-20 max-w-[60%] ">
            <div>
              {data.episodesData.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="bg-black rounded-xl py-10 my-5 px-40"
                  >
                    <div>
                      <h3 className="text-white relative text-center font-semibold mb-2">
                        <span className="text-xl">{item.chapterTitle}</span>
                        <span className="text-lg ml-2">
                          {item.resolutionText}
                        </span>
                      </h3>
                    </div>
                    <div className="flex justify-center mt-4 mb-4 flex-wrap w-full">
                      {item.episodes.map((item2, index2) => {
                        console.log(item2);
                        return (
                          <div
                            key={index2}
                            className="w-1/7 mb-4 relative group rounded-lg"
                          >
                            {Object.keys(item2).map(
                              (episodeKey, episodeIndex) => {
                                return (
                                  <div
                                    className="text-white font-sans flex"
                                    key={episodeIndex}
                                  >
                                    <div className="py-2 px-4 bg-gray-600 mx-3 rounded-lg relative group-hover:text-green-500 font-semi-bold">
                                      <a
                                        href={item2[episodeKey].link}
                                      >{`Episode ${index2 + 1}`}</a>
                                      <span className="h-0.5 absolute bottom-0 bg-green-600 inset-x-0 w-0 group-hover:w-full duration-300 rounded-lg "></span>
                                      <span className="h-0.5 absolute top-0 bg-green-600 right-0 w-0 group-hover:w-full duration-300 rounded-lg "></span>
                                      <span className=" absolute left-0 bottom-0 bg-green-600 w-0.5 h-0 group-hover:h-full duration-300 rounded-lg "></span>
                                      <span className=" absolute right-0 top-0 bg-green-600 w-0.5 h-0 group-hover:h-full duration-300 rounded-lg "></span>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <LatestItems
          title="Related Content"
          data={uniqueCombinedData}
          flex={true}
          relatedContent={true}
        />
        {/* <aside>
          <RelatedContent title={data.title} />
        </aside> */}
      </div>
    </>
  );
};

export default page;

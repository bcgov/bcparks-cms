import { useState, useEffect, useCallback } from "react";
import * as cheerio from "cheerio";

export const useContent = (contentHtml) => {
  const [list, setList] = useState([]);
  const [htmlContent, setHtmlContent] = useState('');

  let $;
  const content = contentHtml?.introHtml.data.introHtml;

  useEffect(() => {
    if (content) {
      $ = cheerio.load(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = useCallback(() => {
    if (content) {
      const media = $("figure.media");

      return media?.map(async (index, el) => {
        const $ = cheerio.load(el);
        const getIframe = $("iframe").attr("src")?.split("/");
        const url = getIframe && getIframe[getIframe?.length - 1];
        const fetchVideo = await fetch(
          `https://noembed.com/embed?dataType=json&url=https://www.youtube.com/watch?v=${url}`
        );
        const response = await fetchVideo.json();

        setList((prev) =>
          prev ? [...prev, response.title] : [response.title]
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  useEffect(() => {
    if (content) fetchData();

    if (content && list.length) {
      const $ = cheerio.load(content);
      $("body")
        .toArray()
        .map((element) => {
          return $(element)
            .find("iframe")
            .each((index, video) => {
              const findTitleByIndex = list.filter((e, i) => +i === +index);
              $(video).attr("id", findTitleByIndex);
              $(video).attr("title", findTitleByIndex);
            });
        });
      setHtmlContent($?.html())
    }
  }, [content, fetchData, list]);

  return { introHtml: htmlContent || null };
};


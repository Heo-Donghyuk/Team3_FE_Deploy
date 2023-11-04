import { Hydrate, dehydrate } from "@tanstack/react-query";
import BackArrowContainer from "@/components/atoms/BackArrowContainer";
import MyPageTemplate from "@/components/templates/MyPageTemplate";
import { cookies } from "next/headers";
import queryClient from "@/utils/providers/queryClient";

async function MyPage() {
  await queryClient.prefetchQuery(["/api/users/mine"], async () => {
    const nextCookies = cookies();

    const token = nextCookies.get("token");

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/mine`, {
      headers: {
        Authorization: token?.value || "",
      },
    });
    const data = await response.json();

    return { data };
  });

  const userMinePrefetchState = queryClient.getQueryState<{
    data: {
      response: { districtId: number };
      status: number;
    };
  }>(["/api/users/mine"]);

  if (userMinePrefetchState?.data?.data?.status !== 200) {
    queryClient.removeQueries(["/api/users/mine"]);
  }

  const districtId = userMinePrefetchState?.data?.data?.response?.districtId;

  if (districtId) {
    await queryClient.prefetchQuery([`/api/cities/districts/${districtId}`], async () => {
      const nextCookies = cookies();

      const token = nextCookies.get("token");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cities/districts/${districtId}`, {
        headers: {
          Authorization: token?.value || "",
        },
      });
      const data = await response.json();

      return { data };
    });
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <Hydrate state={dehydratedState}>
      <BackArrowContainer>
        <MyPageTemplate />
      </BackArrowContainer>
    </Hydrate>
  );
}

export default MyPage;

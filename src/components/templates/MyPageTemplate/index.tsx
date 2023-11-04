"use client";

import { getAllRegions } from "@/apis/district";
import { getMyProfile, putProfile } from "@/apis/profile";
import Button from "@/components/atoms/Button";
import CircularProfileImage from "@/components/atoms/CircularProfileImage";
import DropdownBox from "@/components/molecules/DropdownBox";
import useMutateWithQueryClient from "@/hooks/useMutateWithQueryClient";
import useToast from "@/hooks/useToast";
import { validateName } from "@/utils/validation";
import { MutateOptions, useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { MdCameraAlt, MdCheck, MdClose, MdStar } from "react-icons/md";

// POC : Proof of Concept
// - Next13 -> SSR -> SEO
// - 렌더링이 빨라 진다 등등

// Goal -> URL -> Document (Navigate Request) -> "HTML 내용이 들어가있는 상태가 된다."

// Page 컴포넌트에서 prefetchQuery 사용해서 서버사이드에서 API 콜을 할 수 있는가?
/*
- QueryClient를 일치시켜줌 (getQueryClient)
- prefetchState를 가져와서 UserMineApi로부터 districtId를 가져옴
- cities/district API를 prefetchQuery로 가져옴
- 결과적으로 서버에서만 API 콜을 했고, 클라이언트에서는 캐시된 데이터를 가져옴
-> 그럼에도 서버 사이드 렌더링이 안 되었음

layout.tsx에서 RecoilProvider와 QueryProvider를 제거하니 서버 사이드 렌더링이 되었음
-> Recoil을 Next 13과 사용하는 것이 가능한가?
-> React Query를 서버사이드 렌더링 시키려면 어떻게 해야 하는가?
-> QueryClient 선언시 React cache를 제거했더니 서버사이드 렌더링에 성공

서버 사이드 API 콜이 실패했을때, 어떻게 fallback UI를 보여줄 수 있을까?
- Goal : 서버 사이드 API 콜을 실패시키고, suspense를 사용해서 loading.tsx를 보여주는 것
*/

function MyPageTemplate() {
  const { data: profileData } = useQuery(["/api/users/mine"], getMyProfile, { suspense: true });
  const response = profileData?.data?.response;
  const { name, email, verification, averageScore, rating, districtId, profileImage } = response || {};
  const { data: regionData } = useQuery([`/api/cities/districts/${districtId}`], () => getAllRegions(districtId), {
    enabled: !!districtId,
  });
  const cityId = regionData?.data?.response?.cityId;
  const countryId = regionData?.data?.response?.countryId;

  const nameRef = useRef<HTMLInputElement>(null);
  const [nameError, setNameError] = useState("");
  const [regionIds, setRegionIds] = useState({ cityId, countryId, districtId });
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [fileError, setFileError] = useState("");

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameValue = e.target.value;
    const isNameValid = validateName(nameValue);
    if (!isNameValid) setNameError("닉네임은 한글, 영문, 숫자만 가능하며 20자 이하로 입력해주세요.");
    else setNameError("");
  };

  const tenMB = 10485760;
  const fileTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif"];
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || undefined);
    if (file && file.size > tenMB) setFileError("파일의 크기는 10MB를 넘을 수 없습니다.");
    else if (file && !fileTypes.includes(file.type)) setFileError("png, jpg, jpeg, gif 형식의 파일만 허용됩니다.");
    else {
      setFileError("");
    }
  };

  const { addErrorToast, addSuccessToast } = useToast();
  const { mutate: putCurrentProfile, queryClient } = useMutateWithQueryClient(putProfile);
  const mutateOption: MutateOptions = {
    onSuccess: () => {
      addSuccessToast("저장되었습니다.");
      queryClient.invalidateQueries(["/api/users/mine"]);
    },
    onError: (err: any) => {
      const statusCode = err.response?.data?.status;
      if (statusCode === 500) addErrorToast("이미 존재하는 닉네임입니다.");
      else addErrorToast("저장에 실패했습니다");
    },
  };
  const handleOnSubmit = () => {
    const formData = {
      name: nameRef.current?.value || name,
      districtId: regionIds.districtId,
      profileImage: selectedFile,
    };
    if (nameError || fileError) addErrorToast("올바르지 않은 값이 있습니다.");
    else if (!regionIds.districtId) addErrorToast("읍/면/동 단위까지 선택해 주세요.");
    else {
      putCurrentProfile({ formData }, mutateOption);
    }
  };

  return (
    <div className="my-page m-2">
      <h1 className="text-2xl mb-4">마이페이지</h1>
      <div className="my-page-content flex flex-col gap-4">
        <div className="nickname flex gap-4 items-center">
          <h2 className="text-xl">닉네임</h2>
          <input
            type="text"
            ref={nameRef}
            defaultValue={name}
            onChange={handleNameInputChange}
            className="border border-neutral-400 rounded px-3 py-1"
          />
          {nameError && <span className="text-red-500">{nameError}</span>}
        </div>
        <div className="email flex gap-4 items-center">
          <h2 className="text-xl">이메일</h2>
          <span>{email}</span>
          {verification ? (
            <span className="text-green-500 flex items-center gap-1">
              <MdCheck className="inline" />
              이메일 인증 완료
            </span>
          ) : (
            <span className="text-red-500 flex items-center gap-1">
              <MdClose />
              이메일 미인증
            </span>
          )}
        </div>
        <div className="region flex flex-col gap-4">
          <h2 className="text-xl">지역</h2>
          {/* <DropdownBox selectedOptionIds={regionIds} setSelectedOptionIds={setRegionIds} styleType="small" /> */}
        </div>
        <div className="profile-image flex flex-col gap-4">
          <h2 className="text-xl">프로필 이미지</h2>
          <div className="flex gap-4 items-center">
            <CircularProfileImage
              src={selectedFile ? URL.createObjectURL(selectedFile) : profileImage}
              styleType="xl"
            />
            <Button
              rounded="full"
              size="sm"
              styleType="outlined-orange"
              fontWeight="normal"
              onClick={() => {
                setSelectedFile(undefined);
                fileRef.current?.click();
              }}
            >
              <span className="flex items-center text-sm gap-1">
                <MdCameraAlt />
                이미지 변경
              </span>
            </Button>
            <span className="text-red-500">{fileError}</span>
            <input
              type="file"
              ref={fileRef}
              accept="image/png, image/jpg, image/jpeg, image/gif"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>
        <div className="star-rating flex gap-4">
          <h2 className="text-xl">매너점수</h2>
          <span className="text-xl flex gap-1 items-center">
            <MdStar className="inline text-thunderOrange" /> {rating} / 5
          </span>
        </div>
        <div className="avg flex gap-4">
          <h2 className="text-xl">Average</h2>
          <span className="text-xl">{averageScore}</span>
        </div>
      </div>
      <div className="flex justify-evenly mt-10">
        <Button rounded="full" size="lg" styleType="thunder" onClick={handleOnSubmit}>
          변경사항 저장
        </Button>
      </div>
    </div>
  );
}

export default MyPageTemplate;

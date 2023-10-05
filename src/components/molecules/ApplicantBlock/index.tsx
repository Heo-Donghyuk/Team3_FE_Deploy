import { deleteRejectApplicant, putAcceptApplicant } from "@/apis/application";
import Button from "@/components/atoms/Button";
import CircularProfileImage from "@/components/atoms/CircularProfileImage";
import { Applicant } from "@/types/applicant";
import { useCallback } from "react";

interface Prop {
  postId: number;
  applicantData: Applicant;
}

function ApplicantBlock({ postId, applicantData }: Prop) {
  const { user, status: isAccept } = applicantData;

  const handleAcceptReject = useCallback(
    (type: "accept" | "reject") => {
      if (type === "accept") {
        try {
          putAcceptApplicant(postId, user.id);
        } catch {
          alert("수락 요청이 실패했습니다.");
        }
      } else {
        try {
          deleteRejectApplicant(postId, user.id);
        } catch {
          alert("거절 요청이 실패했습니다.");
        }
      }
    },
    [postId, user.id],
  );

  return (
    <div className="applicant flex items-center justify-between border rounded-2xl py-2 px-4">
      <div className="user-info flex gap-2 items-center">
        <CircularProfileImage src={user.profileImage} styleType="lg" />
        <div className="user-info-text flex flex-col justify-start">
          <span className="block w-fit font-bold text-slate-700">{user.name}</span>
          <span className="block w-fit text-sm text-neutral-500">{`매너점수 ★ ${
            user.rating ? `${user.rating}/5` : "없음"
          }`}</span>
        </div>
      </div>
      <div className="confirm-control flex gap-3">
        {isAccept ? (
          <>
            <Button styleType="outlined_gray_full_sm" onClick={() => handleAcceptReject("reject")}>
              <span className="block text-sm font-normal min-w-[40px] leading-none fontsize">거절</span>
            </Button>
            <Button styleType="thunder_full_sm" onClick={() => handleAcceptReject("accept")}>
              <span className="block text-sm font-normal min-w-[40px]">수락</span>
            </Button>
          </>
        ) : (
          <span>수락됨</span>
        )}
      </div>
    </div>
  );
}

export default ApplicantBlock;

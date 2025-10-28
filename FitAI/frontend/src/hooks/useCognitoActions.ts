import Swal from "sweetalert2";
import {
  updateUserAttributes,
  verifyUserAttribute,
  changePassword,
  forgotPassword,
  confirmForgotPassword,
} from "../api/cognito";

function getFriendlyErrorMessage(error: any): string {
  const code = error?.code || error?.name || "";
  const msg = error?.message || error?.toString() || "";

  switch (code) {
    case "NotAuthorizedException":
      if (msg.includes("Incorrect username or password"))
        return "현재 비밀번호가 올바르지 않습니다.";
      return "권한이 없습니다. 다시 로그인해주세요.";
    case "LimitExceededException":
      return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
    case "CodeMismatchException":
      return "입력하신 인증 코드가 올바르지 않습니다. 다시 확인해주세요.";
    case "ExpiredCodeException":
      return "인증 코드가 만료되었습니다. 새 코드를 요청해주세요.";
    case "UserNotFoundException":
      return "등록되지 않은 사용자입니다.";
    case "InvalidParameterException":
      return "입력값이 올바르지 않습니다. 다시 확인해주세요.";
    case "TooManyRequestsException":
      return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
    case "InvalidPasswordException":
      return "새 비밀번호가 보안 정책에 맞지 않습니다.\n(8자 이상, 대문자·숫자·특수문자 포함 필요)";
    case "PasswordResetRequiredException":
      return "비밀번호 재설정이 필요합니다. 초기화 절차를 진행해주세요.";
    default:
      if (msg.includes("Access Token does not have required scopes"))
        return "세션이 만료되었습니다. 다시 로그인해주세요.";
      if (msg.includes("Invalid verification code") || msg.includes("Invalid code provided"))
        return "입력하신 인증 코드가 잘못되었습니다. 다시 확인해주세요.";
      return "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}

export const useCognitoActions = (auth: any) => {
  const accessToken = auth.user?.access_token;

  // ✅ 이름 저장
  const saveName = async (name: string, profile: any) => {
    if (!accessToken)
      return Swal.fire("로그인 필요", "세션이 만료되었습니다. 다시 로그인해주세요.", "warning");

    if (!name || name === profile?.name)
      return Swal.fire("알림", "변경된 이름이 없습니다.", "info");

    try {
      await updateUserAttributes(accessToken, { name });
      Swal.fire("저장 완료", "이름이 변경되었습니다.", "success");
      await auth.signinSilent();
    } catch (error: any) {
      Swal.fire("오류", getFriendlyErrorMessage(error), "error");
    }
  };

  // ✅ 이메일 저장 (인증 후만 가능)
  const saveEmail = async (email: string, profile: any) => {
    if (!accessToken)
      return Swal.fire("로그인 필요", "세션이 만료되었습니다. 다시 로그인해주세요.", "warning");

    if (!email || email === profile?.email)
      return Swal.fire("알림", "변경된 이메일이 없습니다.", "info");

    try {
      await updateUserAttributes(accessToken, { email });
      Swal.fire("인증 코드 발송", "새 이메일로 인증 코드가 전송되었습니다.", "info");
    } catch (error: any) {
      Swal.fire("오류", getFriendlyErrorMessage(error), "error");
    }
  };

  // ✅ 이메일 인증 코드 확인
  const verifyEmail = async (emailCode: string) => {
    if (!accessToken)
      return Swal.fire("로그인 필요", "세션이 만료되었습니다. 다시 로그인해주세요.", "warning");
    if (!emailCode)
      return Swal.fire("입력 필요", "이메일 인증 코드를 입력하세요.", "info");

    try {
      await verifyUserAttribute(accessToken, "email", emailCode);
      Swal.fire("인증 완료", "이메일 인증이 완료되었습니다.", "success");
      await auth.signinSilent();
      return true;
    } catch (error: any) {
      Swal.fire("오류", getFriendlyErrorMessage(error), "error");
      return false;
    }
  };

  // ✅ 비밀번호 변경
  const changePw = async (oldPw: string, newPw: string) => {
    if (!accessToken)
      return Swal.fire("로그인 필요", "세션이 만료되었습니다. 다시 로그인해주세요.", "warning");

    try {
      await changePassword(accessToken, oldPw, newPw);
      Swal.fire("성공", "비밀번호가 변경되었습니다.", "success");
    } catch (error: any) {
      Swal.fire("오류", getFriendlyErrorMessage(error), "error");
    }
  };

  // ✅ 비밀번호 초기화 시작
  const startResetPw = async (username: string) => {
    if (!username)
      return Swal.fire("오류", "사용자 이름을 확인할 수 없습니다.", "error");
    try {
      await forgotPassword(username);
      Swal.fire("코드 발송", "이메일로 인증 코드가 전송되었습니다.", "info");
    } catch (error: any) {
      Swal.fire("오류", getFriendlyErrorMessage(error), "error");
    }
  };

  // ✅ 비밀번호 초기화 완료 (성공 시 true 반환)
  const confirmResetPw = async (username: string, code: string, newPw: string) => {
    if (!username)
      return Swal.fire("오류", "사용자 이름을 확인할 수 없습니다.", "error");
    if (!code || !newPw)
      return Swal.fire("입력 필요", "코드와 새 비밀번호를 모두 입력하세요.", "info");

    try {
      await confirmForgotPassword(username, code, newPw);
      Swal.fire("성공", "비밀번호가 초기화되었습니다. 새 비밀번호로 로그인해주세요.", "success");
      return true;
    } catch (error: any) {
      Swal.fire("오류", getFriendlyErrorMessage(error), "error");
      return false;
    }
  };

  return { saveName, saveEmail, verifyEmail, changePw, startResetPw, confirmResetPw };
};

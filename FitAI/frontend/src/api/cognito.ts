import {
  CognitoIdentityProviderClient,
  UpdateUserAttributesCommand,
  VerifyUserAttributeCommand,
  ChangePasswordCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

/** 리전은 본인 User Pool 리전에 맞게 */
const REGION = "ap-northeast-2";
/** 로그인/로그아웃에 쓰던 clientId 그대로 */
const CLIENT_ID = "4ms22p52tnirk6qric8oq420j1";

const cip = new CognitoIdentityProviderClient({
  region: REGION,
  maxAttempts: 1, // ✅ SDK의 자동 재시도 완전히 해제
});

/**
 * 이름/이메일 등 사용자 속성 업데이트
 * - accessToken: react-oidc-context의 auth.user?.access_token
 * - attrs: { name?: string; email?: string; ... }
 */
export async function updateUserAttributes(accessToken: string, attrs: Record<string, string>) {
  const UserAttributes = Object.entries(attrs).map(([Name, Value]) => ({ Name, Value }));
  const cmd = new UpdateUserAttributesCommand({ AccessToken: accessToken, UserAttributes });
  return await cip.send(cmd);
}

/**
 * 이메일/전화번호 등 검증코드 확인
 * - AttributeName: "email" | "phone_number"
 * - Code: 메일/SMS로 받은 6자리
 */
export async function verifyUserAttribute(accessToken: string, AttributeName: string, Code: string) {
  const cmd = new VerifyUserAttributeCommand({ AccessToken: accessToken, AttributeName, Code });
  return await cip.send(cmd);
}

/**
 * 비밀번호 변경 (로그인 상태에서)
 */
export async function changePassword(accessToken: string, oldPassword: string, newPassword: string) {
  const cmd = new ChangePasswordCommand({
    AccessToken: accessToken,
    PreviousPassword: oldPassword,
    ProposedPassword: newPassword,
  });
  return await cip.send(cmd);
}

/**
 * 비밀번호 초기화 시작 (로그아웃 상태에서도 가능)
 * - username: Cognito의 사용자명 (일반적으로 'cognito:username' 클레임)
 */
export async function forgotPassword(username: string) {
  const cmd = new ForgotPasswordCommand({ ClientId: CLIENT_ID, Username: username });
  return await cip.send(cmd);
}

/**
 * 비밀번호 초기화 완료 (코드 + 새 비번 제출)
 */
export async function confirmForgotPassword(username: string, code: string, newPassword: string) {
  const cmd = new ConfirmForgotPasswordCommand({
    ClientId: CLIENT_ID,
    Username: username,
    ConfirmationCode: code,
    Password: newPassword,
  });
  return await cip.send(cmd);
}

import { 
  CognitoUserPool, 
  CognitoUser, 
  AuthenticationDetails, 
  CognitoUserSession,
  CognitoUserAttribute,
  ICognitoUserPoolData,
  IAuthenticationDetailsData
} from 'amazon-cognito-identity-js';

// 환경 변수 확인 함수
const getEnvVar = (key: keyof ImportMetaEnv): string => {
  const value = import.meta.env[key];
  if (!value) {
    console.error(`❌ 환경 변수 ${key}가 설정되지 않았습니다.`);
    console.error('📝 .env 파일을 확인하세요:');
    console.error(`   ${key}=your_value_here`);
  }
  return value || '';
};

// Cognito 설정
const poolData: ICognitoUserPoolData = {
  UserPoolId: getEnvVar('VITE_COGNITO_USER_POOL_ID'),
  ClientId: getEnvVar('VITE_COGNITO_CLIENT_ID'),
};

// 초기화 체크
if (!poolData.UserPoolId || !poolData.ClientId) {
  console.error('❌ Cognito 설정 오류!');
  console.error('현재 환경 변수:');
  console.error('  VITE_COGNITO_USER_POOL_ID:', poolData.UserPoolId || '(없음)');
  console.error('  VITE_COGNITO_CLIENT_ID:', poolData.ClientId ? '(설정됨)' : '(없음)');
  console.error('\n.env 파일 확인:');
  console.error('  VITE_COGNITO_USER_POOL_ID=ap-northeast-2_kdyn72zdu');
  console.error('  VITE_COGNITO_CLIENT_ID=38788ldnhhsrtbc1legs2vm5a1');
} else {
  console.log('✅ Cognito 설정 완료');
  console.log('  User Pool ID:', poolData.UserPoolId);
  console.log('  Client ID:', poolData.ClientId.substring(0, 8) + '...');
}

const userPool = new CognitoUserPool(poolData);

// 현재 로그인한 사용자 세션 가져오기
export const getCurrentUser = (): Promise<CognitoUserSession | null> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(session);
    });
  });
};

// User ID (sub) 가져오기
export const getUserId = async (): Promise<string | null> => {
  try {
    const session = await getCurrentUser();
    if (!session) {
      console.warn('⚠️ 로그인되지 않음');
      return null;
    }

    const idToken = session.getIdToken();
    const userId = idToken.payload.sub as string;
    
    console.log('✅ Current User ID:', userId);
    return userId;
  } catch (error) {
    console.error('❌ User ID 가져오기 실패:', error);
    return null;
  }
};

// 사용자 정보 가져오기
export const getUserInfo = async () => {
  try {
    const session = await getCurrentUser();
    if (!session) return null;

    const idToken = session.getIdToken();
    const payload = idToken.payload;
    
    return {
      userId: payload.sub as string,
      email: payload.email as string,
      name: (payload.name || payload.email) as string,
      emailVerified: payload.email_verified as boolean,
    };
  } catch (error) {
    console.error('❌ 사용자 정보 가져오기 실패:', error);
    return null;
  }
};

// 로그인
export const signIn = (username: string, password: string): Promise<CognitoUserSession> => {
  return new Promise((resolve, reject) => {
    const authenticationData: IAuthenticationDetailsData = {
      Username: username,
      Password: password,
    };
    
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: username,
      Pool: userPool,
    };
    
    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session: CognitoUserSession) => {
        console.log('✅ 로그인 성공');
        console.log('User ID:', session.getIdToken().payload.sub);
        resolve(session);
      },
      onFailure: (err: Error) => {
        console.error('❌ 로그인 실패:', err);
        reject(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        console.log('⚠️ 새 비밀번호 필요');
        reject(new Error('새 비밀번호가 필요합니다'));
      },
    });
  });
};

// 로그아웃
export const signOut = (): void => {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
    console.log('✅ 로그아웃 완료');
  }
};

// 로그인 상태 확인
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const session = await getCurrentUser();
    return session !== null && session.isValid();
  } catch {
    return false;
  }
};

// 회원가입 (수정됨)
export const signUp = (email: string, password: string, name?: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const attributeList: CognitoUserAttribute[] = [];
    
    if (name) {
      const attributeName = new CognitoUserAttribute({
        Name: 'name',
        Value: name,
      });
      attributeList.push(attributeName);
    }

    // 이메일 속성 추가 (선택사항)
    const attributeEmail = new CognitoUserAttribute({
      Name: 'email',
      Value: email,
    });
    attributeList.push(attributeEmail);

    userPool.signUp(
      email,
      password,
      attributeList,
      [],
      (err, result) => {
        if (err) {
          console.error('❌ 회원가입 실패:', err);
          reject(err);
          return;
        }
        console.log('✅ 회원가입 성공:', result);
        resolve(result);
      }
    );
  });
};

// 이메일 인증
export const confirmSignUp = (username: string, code: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: username,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        console.error('❌ 인증 실패:', err);
        reject(err);
        return;
      }
      console.log('✅ 인증 성공:', result);
      resolve(result);
    });
  });
};

// 비밀번호 재설정 요청
export const forgotPassword = (username: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: username,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.forgotPassword({
      onSuccess: (result) => {
        console.log('✅ 비밀번호 재설정 코드 전송:', result);
        resolve(result);
      },
      onFailure: (err) => {
        console.error('❌ 비밀번호 재설정 실패:', err);
        reject(err);
      },
    });
  });
};

// 비밀번호 재설정 확인
export const confirmPassword = (
  username: string,
  verificationCode: string,
  newPassword: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: username,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmPassword(verificationCode, newPassword, {
      onSuccess: () => {
        console.log('✅ 비밀번호 재설정 완료');
        resolve('비밀번호가 성공적으로 변경되었습니다');
      },
      onFailure: (err) => {
        console.error('❌ 비밀번호 재설정 확인 실패:', err);
        reject(err);
      },
    });
  });
};
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 한국 시간대
export const KOREA_TIMEZONE = 'Asia/Seoul';

/**
 * 현재 한국 시간을 가져옵니다
 */
export const getKoreaTime = (): Date => {
  const now = new Date();
  const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return koreaTime;
};

/**
 * UTC 시간을 한국 시간으로 변환합니다
 */
export const toKoreaTime = (date: Date): Date => {
  const koreaTime = new Date(date.getTime() + (9 * 60 * 60 * 1000));
  return koreaTime;
};

/**
 * 한국 시간을 UTC로 변환합니다
 */
export const toUTC = (koreaTime: Date): Date => {
  return zonedTimeToUtc(koreaTime, KOREA_TIMEZONE);
};

/**
 * 한국 시간으로 날짜를 포맷합니다
 */
export const formatKoreaTime = (date: Date, formatString: string): string => {
  const koreaTime = toKoreaTime(date);
  return format(koreaTime, formatString, { 
    locale: ko 
  });
};

/**
 * 한국 시간으로 날짜를 포맷합니다 (로케일 포함)
 */
export const formatKoreaTimeWithLocale = (date: Date, formatString: string): string => {
  const koreaTime = toKoreaTime(date);
  return format(koreaTime, formatString, { 
    locale: ko 
  });
};

/**
 * 간단한 한국 시간 포맷팅
 */
export const formatKoreaTimeSimple = (date: Date): string => {
  const koreaTime = toKoreaTime(date);
  const year = koreaTime.getFullYear();
  const month = String(koreaTime.getMonth() + 1).padStart(2, '0');
  const day = String(koreaTime.getDate()).padStart(2, '0');
  const hours = String(koreaTime.getHours()).padStart(2, '0');
  const minutes = String(koreaTime.getMinutes()).padStart(2, '0');
  
  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};

/**
 * 문자열 날짜를 한국 시간으로 파싱합니다
 */
export const parseKoreaTime = (dateString: string): Date => {
  const utcDate = new Date(dateString);
  return toKoreaTime(utcDate);
};

/**
 * 한국 시간 기준으로 날짜가 지났는지 확인합니다
 */
export const isDeadlinePassed = (deadline: string | Date): boolean => {
  const koreaNow = getKoreaTime();
  const koreaDeadline = typeof deadline === 'string' ? parseKoreaTime(deadline) : toKoreaTime(deadline);
  return koreaDeadline < koreaNow;
};

/**
 * 디버깅용: 시간 정보를 출력합니다
 */
export const debugTime = (date: Date, label: string = 'Date') => {
  console.log(`${label}:`, {
    original: date.toISOString(),
    koreaTime: toKoreaTime(date).toISOString(),
    formatted: formatKoreaTimeWithLocale(date, 'yyyy년 MM월 dd일 HH:mm:ss'),
    timezone: KOREA_TIMEZONE
  });
}; 
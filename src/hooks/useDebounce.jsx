import { useState, useEffect } from 'react';

/**
 * 디바운싱을 위한 커스텀 훅
 * @param {any} value - 디바운스할 값 (예: 검색어)
 * @param {number} delay - 디바운스 지연 시간 (ms)
 * @returns {any} 디바운스된 값
 */
export const useDebounce = (value, delay) => {
  // 디바운스된 값을 저장하기 위한 상태
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // value가 변경된 후 delay 시간만큼 기다렸다가 debouncedValue를 업데이트합니다.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 다음 effect가 실행되기 전에 이전 타이머를 정리합니다.
    // 사용자가 delay 시간 내에 다시 타이핑하면 이전 타이머는 취소되고 새 타이머가 설정됩니다.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // value나 delay가 변경될 때만 effect를 다시 실행합니다.

  return debouncedValue;
};

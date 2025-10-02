const USER_CACHE_KEY = 'userData';

export const userData = {
  name: '',
  mobile_number: '',
  gender: '',
  weight: null,
  height: null,
  training_time: '',
  profession: '',
  goal: '',
  diet_preference: '',
  age: null,
  is_pro_user: false,
  targeted_weight: null,
  trainer_id: null,
  subscription_expiry: null, // set later if needed
};

export function updateUserFieldLocally(key, value) {
  userData[key] = value;
}

export function patchUserCache(field, value) {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    const current = raw && raw !== 'undefined' ? JSON.parse(raw) : {};
    const next = { ...current, [field]: value };
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(next));
    return next;
  } catch (e) {
    console.warn('userData patch failed:', e);
    return null;
  }
}

export function getUserData() {
  return userData;
}

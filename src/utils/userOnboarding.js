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

export function getUserData() {
  return userData;
}

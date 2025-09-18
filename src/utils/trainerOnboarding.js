export const trainerData = {
    mobile_number: '',
    trainer_id: '',
  };
  
  export function updateTrainerField(key, value) {
    trainerData[key] = value;
  }
  
  export function getTrainerData() {
    return trainerData;
  }

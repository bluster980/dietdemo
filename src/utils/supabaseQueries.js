import { supabase } from '../utils/supabaseClient';
import CurrentTime from '../components/CurrentTime';
// import toast from 'react-hot-toast';

const { getLocalDateString, getLocalTimeString } = CurrentTime;

export async function insertUser(userObj) {
  const { data, error } = await supabase
    .from('users')
    .insert([userObj])
    .select(); // 👈 This will return the newly inserted user(s) with all fields, including user_id

  if (error) {
    console.error('Error inserting user:', error.message);
  } else {
    console.log('✅ User inserted:', data);
  }

  return { data: data ? data[0] : null, error }; // return the first user inserted
}

export async function updateUserField(userId, field, value) {
    if (!userId || !field || value === undefined) {
      console.warn("Invalid parameters to updateUserField", { userId, field, value });
      return { data: null, error: "Invalid parameters" };
    }

    const { data, error } = await supabase
      .from('users')
      .update({ [field]: value })
      .eq('user_id', userId)
      .select(); // 👈 This will return the newly inserted user(s) with all fields, including user_id
  
    if (error) {
      console.error('Error updating user:', error.message);
    } else {
      console.log('User updated:', data);
      // toast.success("User updated successfully!", { duration: 5000 });
    }
  
    return { data: data ? data[0] : null, error }; // return the first user inserted
}

export async function insertWeightRecord(weightObj) {
    const { data, error } = await supabase
      .from('weightrecords')
      .insert([weightObj])
      .select(); // 👈 This will return the newly inserted user(s) with all fields, including user_id
  
    if (error) {
      console.error('Error inserting weight record:', error.message);
    } else {
      console.log('✅ Weight record inserted:', data);
      // toast.success("Weight recorded successfully!", { duration: 5000 });
    }
  
    return { data: data ? data[0] : null, error }; // return the first user inserted
}

export async function fetchWeightRecords(userId) {
    const { data, error } = await supabase
      .from('weightrecords')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });
  
    if (error) {
      console.error('Error fetching weight records:', error.message);
    } else {
      console.log('✅ Weight records fetched:', data);
    }
  
    return { data, error };
}


export async function insertTrainer(trainerObj) {
  const { data, error } = await supabase
    .from('trainers')
    .insert([trainerObj])
    .select(); // 👈 This will return the newly inserted user(s) with all fields, including user_id

  if (error) {
    console.error('Error inserting trainer:', error.message);
  } else {
    console.log('✅ Trainer inserted:', data);
  }

  return { data: data ? data[0] : null, error }; // return the first user inserted
}


export async function isTrainerIdAvailable(trainerId) {
    const { data, error } = await supabase
      .from('trainers')
      .select('*')
      .eq('trainer_id', trainerId);
  
    if (error) {
      console.error('Error checking trainer ID availability:', error.message);
      return false;
    }
  
    return data.length === 0;
}

export async function fetchWorkoutPlans(userId) {
    const { data, error } = await supabase
      .from('workoutplans')
      .select('*')
      .eq('user_id', userId);
      // .order('date', { ascending: true });
  
    if (error) {
      console.error('Error fetching workout plans:', error.message);
    } else {
      console.log('✅ Workout plans fetched:', data);
    }
  
    return { data, error };
}


export const updateOrInsertWeightRecord = async (user_id, weight) => {
  const date = getLocalDateString(0); // today's date in YYYY-MM-DD
  
  const { data: existing, error: fetchError } = await supabase
  .from('weightrecords')
  .select('weight_record') // only selecting a valid column
  .eq('user_id', user_id)
  .eq('date', date)
    .maybeSingle(); // safer than .single() when record may not exist

  if (fetchError) {
    console.error('Error checking existing weight record:', fetchError);
    return { error: fetchError };
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from('weightrecords')
      .update({ weight_record: weight })
      .eq('user_id', user_id)
      .eq('date', date); // ✅ use composite key for update
    return { error: updateError };
  } else {
    const { error: insertError } = await supabase
    .from('weightrecords')
    .insert({ user_id, date, weight_record: weight });
    return { error: insertError };
  }
};

export async function fetchUserWorkoutWithDetails(user_id) {
  const { data, error } = await supabase
    .from('workoutplans')
    .select(`
      day_of_week,
      exercise_name,
      exercises (
        exercise_name,
        target,
        reps,
        sets,
        rest,
        gif_url
      )
    `)
    .eq('user_id', user_id);

  return { data, error };
}


export async function fetchUserDietWithDetails(user_id) {
  const { data, error } = await supabase
    .from('dietplans')
    .select(`
      day_of_week,
      meal_name,
      meal_time,
      quantity,
      meals (
        meal_name,
        calories,
        protein,
        carbs,
        fat,
        img_url
      )
    `)
    .eq('user_id', user_id);

  return { data, error };
}

export const createQnaNotification = async ({ content, sender_id, receiver_id }) => {
  const time = getLocalTimeString();
  const { data, error } = await supabase
    .from('notifications')
    .insert([
      {
        content,
        sender_id,
        receiver_id,
        time: time, // server timestamp
        answer: null,
        type: 'qna'
      }
    ]);

  if (error) {
    console.error('Error creating QnA notification:', error.message);
    return { success: false, error };
  }

  return { success: true, data };
};

export const createMeetingNotification = async ({ content, sender_id, receiver_id }) => {
  const time = getLocalTimeString();
  const { data, error } = await supabase
    .from('notifications')
    .insert([
      {
        content,
        sender_id,
        receiver_id,
        time: time, // server timestamp
        answer: null,
        type: 'meeting'
      }
    ]);

  if (error) {
    console.error('Error creating Meeting notification:', error.message);
    return { success: false, error };
  }

  return { success: true, data };
};

export const getTrainerUserId = async (trainerId) => {
  const { data, error } = await supabase
    .from('trainers')
    .select('user_id')
    .eq('trainer_id', trainerId)
    .single();

  if (error) {
    console.error('Error fetching trainer user_id:', error.message);
    return null;
  }

  return data.user_id;
};

export async function insertUpload({ user_id, image_url }) {
  const time = getLocalTimeString();

  const { data, error } = await supabase.from('uploads').insert([
    {
      user_id,
      image_url,
      timestamp: time, // optional; Supabase can also auto-gen
    },
  ]);

  if (error) {
    console.error('Error inserting into uploads table:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function fetchLatestQnaQuestion(senderId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('time, content')
    .eq('sender_id', senderId)
    .eq('type', 'qna')
    .order('time', { ascending: false }) // latest first
    .limit(1); // only need the newest

  if (error) {
    console.error('Error fetching latest QnA question:', error.message);
    return { data: null, error };
  }

  // Will return [] if user never asked a question
  return { data: data?.[0] || null, error: null };
}

export async function fetchLatestMeeting(senderId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('time')
    .eq('sender_id', senderId)
    .eq('type', 'meeting')
    .order('time', { ascending: false })
    .limit(1);

  return { data: data?.[0] || null, error };
}

export async function fetchUserNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*') // Or pick needed fields for the card
    .eq('sender_id', userId)
    .not('answer', 'is', null)
    .order('time', { ascending: false });

  return { data, error };
}

export async function getUserFromDb(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

// Upsert the user's streak row and return it
export async function upsertUserStreakRow({ userId, lastActiveDate, currentStreak }) {
  const { data, error } = await supabase
    .from('streaks')
    .upsert(
      {
        user_id: userId,
        last_active_date: lastActiveDate,   // DATE (YYYY-MM-DD)
        current_streak: currentStreak,      // INT
      },
      { onConflict: 'user_id' }             // requires PK/unique on user_id
    )
    .select()
    .single();                              // return the single row

  if (error) {
    console.error('upsertUserStreakRow error:', error.message);
  } else {
    console.log('✅ streak upserted:', data);
  }

  return { data, error };
}


export async function upsertDietPlanEntry(supabase, {userId, dayOfWeek, mealName, mealTime, quantity }) {
  const payload = {
    user_id: userId,
    day_of_week: dayOfWeek,
    meal_name: mealName,
    meal_time: mealTime,
    quantity,
  };

  const { data, error } = await supabase
    .from('dietplans')
    .upsert(payload, {
      onConflict: 'user_id,day_of_week,meal_name,meal_time',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    console.error('upsertDietPlanEntry error:', error);
    return { data: null, error };
  }
  return { data, error: null };
}

export async function upsertWorkoutPlanEntry(supabase, {userId, dayOfWeek, exerciseName, reps, sets }) {
  const payload = {
    user_id: userId,
    day_of_week: dayOfWeek,
    exercise_name: exerciseName,
    reps,
    sets,
  };

  const { data, error } = await supabase
    .from('workoutplans')
    .upsert(payload, {
      onConflict: 'user_id,day_of_week,exercise_name',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    console.error('upsertWorkoutPlanEntry error:', error);
    return { data: null, error };
  }
  return { data, error: null };
}


// utils/supabaseQueries.js
export async function fetchClientsForTrainer(trainerId) {
  const { data, error } = await supabase
    .from('users')
    .select('user_id, name, mobile_number, subscription_expiry')
    .eq('trainer_id', trainerId);

  if (error) {
    console.error('fetchClientsForTrainer error:', error.message);
    return { data: [], error };
  }
  // Return rows directly
  return { data: data || [], error: null };
}

export async function fetchClientRequestForTrainer(trainerId) {
  const { data, error } = await supabase
    .from('clientrequests')
    .select('user_id, users(name, mobile_number)')
    .eq('trainer_id', trainerId);

  if (error) {
    console.error('fetchClientRequestForTrainer error:', error.message);
    return { data: [], error };
  }
  // return as-is, rows have {user_id, users: {name, mobile_number}}
  return { data: data || [], error: null };
}


export async function acceptClientRequest(user_id, trainer_id) {
  const { error: upError } = await supabase
    .from('users')
    .update({ trainer_id })
    .eq('user_id', user_id);
  if (upError) return { error: upError };

  // Then remove from requests
  const { error } = await supabase
    .from('clientrequests')
    .delete()
    .eq('user_id', user_id)
    .eq('trainer_id', trainer_id);
  return { error };
}

export async function rejectClientRequest(user_id, trainer_id) {
  const { error } = await supabase
    .from('clientrequests')
    .delete()
    .eq('user_id', user_id)
    .eq('trainer_id', trainer_id);
  return { error };
}

export async function fetchClientRequestStatus(user_id) {
  const { data, error } = await supabase
    .from('clientrequests')
    .select('user_id, trainer_id')
    .eq('user_id', user_id)
    .limit(1)
    .maybeSingle(); // no 406 on 0 rows; returns data=null

  if (error) {
    console.error('fetchClientRequestStatus error:', error.message);
    return { data: null, error };
  }
  return { data, error: null };
}

export async function addClientRequest(user_id, trainer_id) {
  const { error } = await supabase
    .from('clientrequests')
    .insert({ user_id, trainer_id });
  return { error };
}

export async function removeClientFromTrainer(userId) {
  const { data, error } = await supabase
    .from('users')
    .update({trainer_id: null})
    .eq('user_id', userId);

  if (error) {
    console.error('removeClientFromTrainer error:', error.message);
    return { data: null, error };
  }
  return { data, error: null };
}

export async function updatePlanExpiry(userId, expiryDate) {
  const { data, error } = await supabase
    .from('users')
    .update({ 'subscription_expiry': expiryDate })
    .eq('user_id', userId);

  if (error) {
    console.error('updatePlanExpiry error:', error.message);
    return { data: null, error };
  }
  return { data, error: null };
}

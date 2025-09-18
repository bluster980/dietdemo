const getLocalDateString = (offsetDays = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - offsetDays);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getLocalTimeString = () => {
    const now = new Date();

    const pad = (n) => n.toString().padStart(2, "0");
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    const ms = now.getMilliseconds().toString().padStart(3, "0");

    // timezone offset in minutes and sign
    const timezoneOffset = -now.getTimezoneOffset(); // invert sign for POSIX format
    const sign = timezoneOffset >= 0 ? "+" : "-";
    const offsetHours = pad(Math.floor(Math.abs(timezoneOffset) / 60));
    const offsetMinutes = pad(Math.abs(timezoneOffset) % 60);

    // Construct timestamp string with offset, space instead of T separator
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}${sign}${offsetHours}:${offsetMinutes}`;
};

export default { getLocalDateString, getLocalTimeString };


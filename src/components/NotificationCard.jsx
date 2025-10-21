    import React from 'react';
    import oatmeal from '../assets/oatmeal.png';
    import { parseNotification, formatTime, truncate } from '../utils/notificationHelpers';


    const NotificationCard = ({ notification, onClick, isRead, isLast }) => {
        const { type, title, query } = parseNotification(notification.content);
        const timeStr = formatTime(notification.time);

        return (
            <div className='flex justify-center items-center mt-[10px] w-full ' onClick={onClick} style={{ marginBottom: isLast ? '15px' : '0' }}> 
                <div className="relative flex items-center border border-[#E9ECEF] rounded-[10px] bg-white overflow-hidden" 
                style={{ 
                    width: '95%',
                    // maxWidth: '375px',  // Responsive: use full width up to 355px
                    minHeight: '72px',
                    boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.08)',
                    backgroundColor: "var(--notification-card-bg)",
                    borderColor:"var(--profile-border)",
                }} > 
                    {!isRead && ( <div className="absolute left-0 top-5 bottom-0 w-[4px] rounded-l-[10px] h-[100%]" style={{ backgroundColor: '#4ECDC4' }} /> )}
                    <div className='ml-[10px] rounded-[50%]' style={{boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.25)'}}>
                        <img src={oatmeal} alt="Notification" className='w-[52px] h-[52px] rounded-[10px]' />
                    </div>
                    <div className="flex flex-col ml-[6px] flex-1 min-w-0 pr-2"> 
                        <div className="flex items-baseline justify-between"> 
                            <span className="text-[#2D3436] font-urbanist font-semibold text-[16px] ml-[6px] mt-[-2px]" style={{color: "var(--general-charcoal-text)"}}>{type}</span> 
                            <span className="text-[#909497] font-urbanist text-[12px] whitespace-nowrap mr-[6px]">{timeStr}</span> 
                        </div>
                        <div className='w-full h-[1px] bg-[#F1F3F5] ml-[6px]' style={{ backgroundColor: 'var(--profile-divider)'}}></div> 
                            <span className="text-[#6C757D] font-urbanist text-[13px] ml-[6px] mt-[1px] line-clamp-1" style={{color: "var(--faded-text)"}}>{truncate(title, 40)}</span> 
                            <span className="text-[#6C757D] font-urbanist text-[13px] ml-[6px] mt-[-2px] line-clamp-1" style={{color: "var(--faded-text)"}}>{truncate(query, 40)}</span> 
                    </div>
                </div>
            </div>
        )
    }

    export default NotificationCard;
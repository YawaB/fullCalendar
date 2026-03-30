import './styles/base.css';
import './styles/timeline.css';
import './styles/resources.css';
import './styles/month.css';
import './styles/timegrid.css';

import CalendarCore from './core/calendarCore.js';

class Calendar extends CalendarCore {}

if (typeof window !== 'undefined') {
  window.EasyCal = Calendar;
}

export default Calendar;

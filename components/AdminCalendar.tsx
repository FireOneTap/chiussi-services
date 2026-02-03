'use client'
import React, { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import { supabase } from '../lib/supabase'

export default function AdminCalendar() {
  const [events, setEvents] = useState([])
  const draggedElementRef = useRef(null)
  const calendarRef = useRef(null)

  useEffect(() => {
    fetchEvents()
    setupDragDropHandlers()
    
    return () => {
      cleanupDragDropHandlers()
    }
  }, [])

  const setupDragDropHandlers = () => {
    const externalEvents = document.getElementById('external-events')
    const calendarEl = document.querySelector('.fc')
    
    if (externalEvents) {
      externalEvents.addEventListener('dragstart', handleDragStart)
      externalEvents.addEventListener('dragend', handleDragEnd)
    }
    
    if (calendarEl) {
      calendarEl.addEventListener('dragover', handleDragOver)
      calendarEl.addEventListener('drop', handleDropOnCalendar)
      calendarEl.addEventListener('dragleave', handleDragLeave)
    }
  }

  const cleanupDragDropHandlers = () => {
    const externalEvents = document.getElementById('external-events')
    const calendarEl = document.querySelector('.fc')
    
    if (externalEvents) {
      externalEvents.removeEventListener('dragstart', handleDragStart)
      externalEvents.removeEventListener('dragend', handleDragEnd)
    }
    
    if (calendarEl) {
      calendarEl.removeEventListener('dragover', handleDragOver)
      calendarEl.removeEventListener('drop', handleDropOnCalendar)
      calendarEl.removeEventListener('dragleave', handleDragLeave)
    }
  }

  const handleDragStart = (e) => {
    if (e.target.classList.contains('fc-event-ticket')) {
      draggedElementRef.current = e.target
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/html', e.target.innerHTML)
    }
  }

  const handleDragEnd = () => {
    draggedElementRef.current = null
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragLeave = (e) => {
    if (e.target.classList.contains('fc')) {
      e.dataTransfer.dropEffect = 'none'
    }
  }

  const handleDropOnCalendar = async (e) => {
    e.preventDefault()
    const el = draggedElementRef.current
    if (!el) return
    
    // Récupérer la date/heure du drop
    const rect = document.querySelector('.fc').getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Chercher le slot de calendrier à cette position
    const calendarApi = calendarRef.current?.getApi()
    if (!calendarApi) {
      await handleDrop({ dateStr: new Date().toISOString() })
      return
    }
    
    // Utiliser l'API FullCalendar pour obtenir la date
    const dateInfo = calendarApi.dateForCoordinate({ x, y })
    if (!dateInfo) {
      await handleDrop({ dateStr: new Date().toISOString() })
      return
    }
    
    await handleDrop({ dateStr: dateInfo.dateStr })
  }

  async function fetchEvents() {
    const { data, error } = await supabase.from('appointments').select('*, tickets(*)').order('start_time', { ascending: true })
    if (error) return;
    
    setEvents(data.map(app => {
      // MODE MIROIR : On prend les infos du ticket en priorité, sinon celles de l'appli
      const info = app.tickets || app;
      return {
        id: app.id,
        title: info.full_name || app.title,
        start: app.start_time,
        end: app.end_time,
        extendedProps: {
          city: info.city,
          phone: info.phone,
          email: info.email,
          service: info.service_type,
          description: info.description,
          status: app.status,
          ticketId: app.ticket_id
        },
        backgroundColor: app.status === 'termine' ? '#4ADE80' : '#00D4FF',
        borderColor: 'transparent'
      }
    }))
  }

  const handleEventClick = async (info) => {
    const p = info.event.extendedProps;
    const msg = `CLIENT : ${info.event.title}\n------------------\n` +
                `1. Taper 'OK' -> Terminer/Reprendre\n` +
                `2. Taper 'SUP' -> Supprimer\n` +
                `3. Taper 'MOD' -> Modifier Description\n` +
                `------------------\n` +
                `Infos : ${p.phone} | ${p.city}`;
    
    const action = window.prompt(msg);
    if (!action) return;

    if (action.toUpperCase() === 'OK') {
      const next = p.status === 'termine' ? 'prevu' : 'termine';
      await supabase.from('appointments').update({ status: next }).eq('id', info.event.id);
    } else if (action.toUpperCase() === 'SUP') {
      if (confirm("Supprimer ce rendez-vous ?")) {
        await supabase.from('appointments').delete().eq('id', info.event.id);
      }
    } else if (action.toUpperCase() === 'MOD') {
      const newD = window.prompt("Nouvelle description :", p.description);
      if (newD !== null) {
        // On met à jour l'appointment ET le ticket pour garder le miroir
        await supabase.from('appointments').update({ description: newD }).eq('id', info.event.id);
        if (p.ticketId) await supabase.from('tickets').update({ description: newD }).eq('id', p.ticketId);
      }
    }
    fetchEvents();
  };

  const renderEventContent = (eventInfo) => {
    const p = eventInfo.event.extendedProps;
    const isDone = p.status === 'termine';
    return (
      <div className={`p-2 h-full flex flex-col text-[#1A2E44] leading-tight overflow-hidden ${isDone ? 'opacity-50' : ''}`}>
        <div className="flex justify-between items-start mb-1">
          <span className="text-[7px] font-black bg-black/10 px-1 rounded uppercase truncate">{p.city || 'NC'}</span>
          <span className="text-[7px] font-bold bg-white/40 px-1 rounded uppercase">{p.service || 'Inter'}</span>
        </div>
        <div className="font-black text-[10px] uppercase truncate">{eventInfo.event.title}</div>
        <div className="text-[8px] italic line-clamp-2 my-1 border-l border-black/10 pl-1">{p.description}</div>
        <div className="mt-auto space-y-0.5">
          <div className="text-[8px] font-bold">📞 {p.phone}</div>
          <div className="text-[7px] opacity-70 truncate">{p.email}</div>
        </div>
        {isDone && <div className="absolute top-1 right-1 text-[10px]">✅</div>}
      </div>
    );
  };

  const handleDrop = async (info) => {
    const el = draggedElementRef.current
    if (!el) return
    
    const dateStr = info.dateStr || new Date().toISOString()
    const startTime = new Date(dateStr)
    const endTime = new Date(startTime.getTime() + 5400000) // +1h30
    
    const { error } = await supabase.from('appointments').insert([{
      ticket_id: el.getAttribute('data-id'),
      title: el.getAttribute('title'),
      city: el.getAttribute('data-city'),
      phone: el.getAttribute('data-phone'),
      email: el.getAttribute('data-email'),
      service_type: el.getAttribute('data-service'),
      description: el.getAttribute('data-desc'),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'prevu'
    }]);
    
    if (!error) {
      await supabase.from('tickets').update({ status: 'planifié' }).eq('id', el.getAttribute('data-id'));
      fetchEvents();
      window.dispatchEvent(new Event('ticket-planned'));
      draggedElementRef.current = null
    }
  };

  const handleEventChange = async (info) => {
    // Appelé quand un événement calendrier est modifié (déplacement, redimensionnement)
    await supabase.from('appointments').update({
      start_time: info.event.startStr,
      end_time: info.event.endStr
    }).eq('id', info.event.id);
  };

  return (
    <div className="bg-white/5 p-4 rounded-[2rem] border border-white/10 mt-10 shadow-2xl">
      <style>{`
        .fc-event { border: none !important; cursor: pointer; border-radius: 10px !important; }
        .fc-v-event { background-color: #00D4FF !important; }
        .fc-timegrid-event { min-height: 90px !important; }
      `}</style>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        events={events}
        locale="fr"
        height="850px"
        editable={true}
        droppable={true}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        eventChange={handleEventChange}
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'timeGridWeek,dayGridMonth' }}
      />
    </div>
  )
}
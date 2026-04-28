export const initialData = {
  // ... existing initialData (kept same as before, see below)
  users: [
    {
      id: 'ngo-asha',
      name: 'Asha Foundation',
      email: 'asha@ngo.org',
      password: 'ASHA@2025',
      role: 'ngo',
      status: 'approved',
      regNumber: 'NGO/MH/2019/001',
      contact: '9876543210',
      address: 'Dharavi, Mumbai',
      website: 'ashafoundation.org',
      appliedDate: '2025-04-20',
      available: false,
      tasksCompleted: 0
    },
    {
      id: 'ngo-greenhope',
      name: 'GreenHope NGO',
      email: 'green@hope.org',
      password: 'GH@2025',
      role: 'ngo',
      status: 'approved',
      regNumber: 'NGO/MH/2018/012',
      contact: '9988776655',
      address: 'Govandi, Mumbai',
      website: 'greenhope.org',
      appliedDate: '2025-04-10',
      available: false,
      tasksCompleted: 0
    },
    {
      id: 'vol-priya',
      name: 'Priya Sharma',
      email: 'priya@gmail.com',
      password: 'PS@2025',
      role: 'volunteer',
      status: 'active',
      skills: ['Medical', 'Teaching'],
      contact: '9876500001',
      location: 'Dharavi',
      rating: 4.8,
      tasksCompleted: 7,
      available: true,
      appliedDate: '2025-03-01',
      badges: ['First Responder', '5-Star']
    },
    {
      id: 'vol-rahul',
      name: 'Rahul Mehta',
      email: 'rahul@gmail.com',
      password: 'RM@2025',
      role: 'volunteer',
      status: 'assigned',
      skills: ['Logistics', 'Driving'],
      contact: '9876500002',
      location: 'Kurla',
      rating: 4.5,
      tasksCompleted: 12,
      available: false,
      appliedDate: '2025-02-15',
      badges: ['Marathon', 'First Responder']
    },
    {
      id: 'field-meena',
      name: 'Meena Patil',
      email: 'meena@field.local',
      password: 'MEENA@2025',
      role: 'field_worker',
      status: 'active',
      skills: ['Medical', 'Logistics'],
      contact: '9000000001',
      location: 'Dharavi',
      rating: 4.9,
      tasksCompleted: 5,
      available: true,
      appliedDate: '2025-03-05'
    },
    {
      id: 'admin-user',
      name: 'Admin',
      email: 'admin@communitybridge.org',
      password: 'ADMIN@2025',
      role: 'admin',
      status: 'active',
      available: false,
      appliedDate: '2025-01-01'
    }
  ],
  tasks: [
    {
      id: 'task-001',
      type: 'Food',
      location: 'Dharavi Sector 4',
      urgency: 5,
      people_affected: 12,
      status: 'created',
      description: 'Family cluster with no ration for 3 days.',
      created_by: 'field-meena',
      assigned_to: null,
      assigned_by: null,
      updatedAt: '2026-04-27T08:30:00Z'
    },
    {
      id: 'task-002',
      type: 'Medical',
      location: 'Kurla West',
      urgency: 4,
      people_affected: 3,
      status: 'assigned',
      description: 'Elderly residents need medication and mobility support.',
      created_by: 'field-meena',
      assigned_to: 'vol-priya',
      assigned_by: 'ngo-asha',
      updatedAt: '2026-04-27T10:00:00Z'
    },
    {
      id: 'task-003',
      type: 'Shelter',
      location: 'Chembur',
      urgency: 4,
      people_affected: 50,
      status: 'created',
      description: 'Temporary shelter needed after heavy rain damage.',
      created_by: 'field-meena',
      assigned_to: null,
      assigned_by: null,
      updatedAt: '2026-04-27T06:00:00Z'
    },
    {
      id: 'task-004',
      type: 'Education',
      location: 'Govandi',
      urgency: 2,
      people_affected: 20,
      status: 'completed',
      description: 'After-school tutoring support delivered.',
      created_by: 'field-meena',
      assigned_to: 'vol-rahul',
      assigned_by: 'ngo-greenhope',
      updatedAt: '2026-04-26T14:00:00Z'
    },
    {
      id: 'task-005',
      type: 'Water',
      location: 'Mankhurd',
      urgency: 3,
      people_affected: 8,
      status: 'created',
      description: 'Water supply disrupted, no access for 2 days.',
      created_by: 'field-meena',
      assigned_to: null,
      assigned_by: null,
      updatedAt: '2026-04-27T11:20:00Z'
    }
  ],
  assignments: [
    {
      id: 'assign-001',
      task_id: 'task-002',
      volunteer_id: 'vol-priya',
      ngo_id: 'ngo-asha',
      status: 'assigned',
      assignedAt: '2026-04-27T10:00:00Z',
      updatedAt: '2026-04-27T10:00:00Z'
    },
    {
      id: 'assign-002',
      task_id: 'task-004',
      volunteer_id: 'vol-rahul',
      ngo_id: 'ngo-greenhope',
      status: 'completed',
      assignedAt: '2026-04-26T14:00:00Z',
      updatedAt: '2026-04-26T18:15:00Z'
    }
  ],
  notifications: [
    {
      id: 'note-001',
      user_id: 'ngo-asha',
      type: 'urgent_alert',
      title: 'CRITICAL ALERT',
      message: 'Urgent Food assistance required at Dharavi Sector 4. Respond if nearby.',
      priority: 'high',
      read: false,
      createdAt: '2026-04-27T08:35:00Z'
    },
    {
      id: 'note-002',
      user_id: 'vol-priya',
      type: 'task_assigned',
      title: 'New Mission Directive',
      message: 'You have been assigned to a new task. Acknowledge ASAP.',
      priority: 'high',
      read: false,
      createdAt: '2026-04-27T10:01:00Z'
    },
    {
      id: 'note-003',
      user_id: 'ngo-greenhope',
      type: 'task_completed',
      title: 'Mission Accomplished',
      message: 'Volunteer has successfully completed the assigned task.',
      priority: 'medium',
      read: true,
      createdAt: '2026-04-26T18:20:00Z'
    }
  ],
  ngoRequests: [
    { id: 1, name: "Asha Foundation", regNumber: "NGO/MH/2019/001",
      email: "asha@ngo.org", contact: "9876543210", address: "Dharavi, Mumbai",
      website: "ashafoundation.org", docs: ["reg_cert.pdf","PAN.pdf","80G.pdf"],
      status: "pending", appliedDate: "2025-04-20" },
    { id: 2, name: "Sahyog Trust", regNumber: "NGO/MH/2020/044",
      email: "sahyog@trust.in", contact: "9123456780", address: "Kurla, Mumbai",
      website: "sahyog.in", docs: ["reg_cert.pdf"],
      status: "pending", appliedDate: "2025-04-22" },
    { id: 3, name: "GreenHope NGO", regNumber: "NGO/MH/2018/012",
      email: "green@hope.org", contact: "9988776655", address: "Govandi, Mumbai",
      website: "greenhope.org", docs: ["reg_cert.pdf","PAN.pdf"],
      status: "accepted", appliedDate: "2025-04-10",
      username: "green@hope.org", password: "GH@2025" },
    { id: 4, name: "Naya Savera", regNumber: "NGO/MH/2021/088",
      email: "naya@savera.in", contact: "9000011122", address: "Mankhurd, Mumbai",
      website: "nayasavera.org", docs: ["reg_cert.pdf","PAN.pdf","80G.pdf"],
      status: "declined", appliedDate: "2025-04-15",
      declineReason: "Incomplete documentation" }
  ],
  volunteerRequests: [
    { id: 1, ngo: "Asha Foundation", name: "Priya Sharma", gender: "Female",
      email: "priya@gmail.com", contact: "9876500001",
      skills: ["Medical","Teaching"], description: "I want to help underprivileged children",
      idProof: "aadhar.pdf", doneVolunteering: true, status: "accepted",
      username: "priya@gmail.com", password: "PS@2025",
      tasksCompleted: 7, rating: 4.8, streak: 5, joinedDate: "2025-03-01",
      available: true, location: "Dharavi",
      badges: ["First Responder","5-Star"] },
    { id: 2, ngo: "Asha Foundation", name: "Rahul Mehta", gender: "Male",
      email: "rahul@gmail.com", contact: "9876500002",
      skills: ["Logistics","Driving"], description: "Experienced logistics volunteer, 3 years",
      idProof: "pan.pdf", doneVolunteering: false, status: "accepted",
      username: "rahul@gmail.com", password: "RM@2025",
      tasksCompleted: 12, rating: 4.5, streak: 3, joinedDate: "2025-02-15",
      available: false, location: "Kurla",
      badges: ["Marathon","First Responder"] },
    { id: 3, ngo: "Sahyog Trust", name: "Anita Desai", gender: "Female",
      email: "anita@gmail.com", contact: "9876500003",
      skills: ["Counseling"], description: "Want to support mental health drives",
      idProof: "aadhar.pdf", doneVolunteering: true, status: "pending",
      available: true, location: "Govandi",
      tasksCompleted: 4, rating: 4.9, streak: 2 },
    { id: 4, ngo: "GreenHope NGO", name: "Vikram Nair", gender: "Male",
      email: "vikram@gmail.com", contact: "9876500004",
      skills: ["IT/Tech","Teaching"], description: "Software engineer wanting to give back",
      idProof: "aadhar.pdf", doneVolunteering: false, status: "pending",
      available: true, location: "Mankhurd",
      tasksCompleted: 0, rating: 0, streak: 0 }
  ],
  communityNeeds: [
    { id: 1, location: "Dharavi Sector 4", needType: "Food", urgency: 5,
      people: 12, description: "Family cluster, no ration for 3 days. Children affected.",
      status: "open", assignedVolunteer: null,
      reportedBy: "Meena Patil", reportedAt: "2025-04-27T08:30:00", svgX: 130, svgY: 190 },
    { id: 2, location: "Kurla West", needType: "Medical", urgency: 4,
      people: 3, description: "Elderly residents need medication, mobility issues.",
      status: "assigned", assignedVolunteer: "Priya Sharma",
      reportedBy: "Suresh Kumar", reportedAt: "2025-04-27T10:00:00", svgX: 200, svgY: 210 },
    { id: 3, location: "Govandi", needType: "Education", urgency: 2,
      people: 20, description: "After-school tutoring needed for 20 children.",
      status: "open", assignedVolunteer: null,
      reportedBy: "Fatima Sheikh", reportedAt: "2025-04-26T14:00:00", svgX: 300, svgY: 220 },
    { id: 4, location: "Mankhurd", needType: "Shelter", urgency: 3,
      people: 8, description: "Temporary shelter needed post heavy rain damage.",
      status: "resolved", assignedVolunteer: "Rahul Mehta",
      reportedBy: "Dinesh Rao", reportedAt: "2025-04-25T09:00:00", svgX: 310, svgY: 195 },
    { id: 5, location: "Chembur", needType: "Water", urgency: 4,
      people: 50, description: "Water supply disrupted, no access for 2 days.",
      status: "open", assignedVolunteer: null,
      reportedBy: "Rekha Iyer", reportedAt: "2025-04-27T06:00:00", svgX: 265, svgY: 240 }
  ],
  fieldWorkers: [
    { id: 1, name: "Meena Patil", area: "Dharavi", reportsThisWeek: 5, lastActive: "2h ago", online: true },
    { id: 2, name: "Suresh Kumar", area: "Kurla", reportsThisWeek: 3, lastActive: "30m ago", online: true },
    { id: 3, name: "Fatima Sheikh", area: "Govandi", reportsThisWeek: 2, lastActive: "1d ago", online: false },
    { id: 4, name: "Dinesh Rao", area: "Mankhurd", reportsThisWeek: 4, lastActive: "4h ago", online: true }
  ],
  otherNGOs: [
    { id: 1, name: "Pratham Foundation", focus: "Education", email: "contact@pratham.org", phone: "022-23456789" },
    { id: 2, name: "Robin Hood Army", focus: "Food Relief", email: "mumbai@robinhoodarmy.com", phone: "9876543001" },
    { id: 3, name: "iCall", focus: "Mental Health", email: "icall@tiss.edu", phone: "9152987821" }
  ],
  adminActivityLog: [
    { id: 1, action: "Accepted NGO", entity: "GreenHope NGO", actor: "admin", time: "2025-04-27T11:00:00" },
    { id: 2, action: "Declined NGO", entity: "Naya Savera", actor: "admin", time: "2025-04-26T15:30:00" },
    { id: 3, action: "Accepted Volunteer", entity: "Priya Sharma", actor: "admin", time: "2025-04-25T10:00:00" }
  ],
  volunteerTaskHistory: [
    { id: 1, name: "Medical Supplies Delivery", location: "Dharavi Sector 4",
      date: "2025-04-25", needType: "Medical", status: "completed" },
    { id: 2, name: "Education Tutoring Session", location: "Kurla West",
      date: "2025-04-20", needType: "Education", status: "completed" },
    { id: 3, name: "Flood Assessment Survey", location: "Chembur",
      date: "2025-04-15", needType: "Shelter", status: "declined" }
  ],
  volunteerNotifications: [
    { id: 1, type: "task", message: "New task assigned: Food Aid — Dharavi Sector 4", time: "2h ago", read: false },
    { id: 2, type: "system", message: "Your previous task was marked complete", time: "Yesterday", read: true },
    { id: 3, type: "achievement", message: "You earned the '5-Star' badge!", time: "2 days ago", read: false },
    { id: 4, type: "task", message: "Asha Foundation: New urgent need reported near you", time: "3 days ago", read: true }
  ]
};

export const initializeStore = () => {
  // FORCE RESET cache to deal with crashes caused by older v1 models persisting
  localStorage.removeItem('cb_data'); 
  localStorage.setItem('cb_data', JSON.stringify(initialData));
};

export const getStore = () => {
  return JSON.parse(localStorage.getItem('cb_data') || '{}');
};

export const setStore = (newData) => {
  localStorage.setItem('cb_data', JSON.stringify(newData));
};

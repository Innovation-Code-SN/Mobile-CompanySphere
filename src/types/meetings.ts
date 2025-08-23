export interface Meeting {
  id: string | number;
  titre: string;
  description?: string;
  dateDebut: Date | string;
  dateFin: Date | string;
  statut: 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  
  // Lieu et visio
  lieu?: string;
  salle?: string;
  lienVisio?: string;
  
  // Organisateur (selon les DTOs backend)
  organisateur?: {
    id: string;
    nom: string;
    prenom: string;
  };
  organisateurNom?: string; // Directement depuis MyReunionResponseDto
  
  // Participants (selon interface actuelle)
  participants?: Participant[];
  
  // Statistiques (depuis MyReunionResponseDto)
  nombreParticipants?: number;
  nombreAcceptes?: number;
  nombreRefuses?: number;
  nombreEnAttente?: number;
  
  // Mon statut et participation
  myStatus?: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE' | 'PEUT_ETRE';
  participantId?: string;
  
  // Propriétés calculées
  dureeEnMinutes?: number;
  estEnCours?: boolean;
  canJoinVisio?: boolean;
  canRespond?: boolean;
  isObligatoire?: boolean;
  isOrganizer?: boolean;
  myComment?: string;
  
  // Types et autres
  type?: string;
  ordreJour?: string;
  obligatoire?: boolean;
}

export interface Participant {
  id: string;
  employe: {
    id: string;
    nom: string;
    prenom: string;
    email?: string;
  };
  statut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE' | 'PEUT_ETRE';
  obligatoire: boolean;
  commentaire?: string;
}
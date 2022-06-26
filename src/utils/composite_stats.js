const composite_stats = (stats, stat_id, is_str=false) => {
  if(is_str) {
    return composite_stats_str(stats, stat_id);
  }
  else {
    // Handle 0/0
    const result = composite_stats_value(stats, stat_id);
    return isNaN(result) ? undefined : result;
  }
}

const composite_stats_formula = (stat_id) => {
  switch (stat_id) {
    case 3: // AVG: H/AB
      return 'H/AB';
    case 4: // OBP: (H+BB+HBP)/(AB+BB+HBP+SF)
      return '(H+BB+HBP)/(AB+BB+HBP+SF)';
    case 5: // SLG: TB/AB
      return 'TB/AB';
    case 26: // ERA: ER/OUTS*27
      return 'ER/OUTS*27';
    case 27: // WHIP: (H+BB)/OUTS*3
      return '(H+BB)/OUTS*3';
    case 50: // IP: OUTS/3
      return 'OUTS/3';
    case 54: // FPCT: (PO+A)/(PO+A+E)
      return '(PO+A)/(PO+A+E)';
    case 55: // OPS: (H+BB+HBP)/(AB+BB+HBP+SF) + TB/AB
      return '(H+BB+HBP)/(AB+BB+HBP+SF) + TB/AB';
    case 56: // K/BB: K/BB
      return 'K/BB';
    case 57: // K/9: K/OUTS*27
      return 'K/OUTS*27';
    case 60: // H/AB: H/AB
      return 'H/AB';
    case 61: // XBH: 2B+3B+HR
      return '2B+3B+HR';
    case 62: // NSB: SB-CS
      return 'SB-CS';
    case 63: // SB%: SB/(SB+CS)
      return 'SB/(SB+CS)';
    case 65: // PA: AB+BB+HBP+SH+SF+CI
      return 'AB+BB+HBP+SH+SF+CI';
    case 74: // OBPA: (H+BB+HBP)/TBF
      return '(H+BB+HBP)/TBF';
    case 75: // WIN%: W/(W+L)
      return 'W/(W+L)';
    case 76: // 1BA: H-2BA-3BA-HR
      return 'H-2BA-3BA-HR';
    case 77: // H/9: H/OUTS*27
      return 'H/OUTS*27';
    case 78: // BB/9: BB/OUTS*27
      return 'BB/OUTS*27';
    case 81: // SV%: SV/SVOP
      return 'SV/SVOP';
    case 84: // BSV: SVOP-SV
      return 'SVOP-SV';
    case 85: // NSV: SV*2-SVOP
      return 'SV*2-SVOP';
    case 89: // SV+H: SV+HLD
      return 'SV+HLD';
    case 90: // NSVH: SV*2-SVOP+HLD
      return 'SV*2-SVOP+HLD';
    case 91: // NW: W-L
      return 'W-L';
    default:
      return '';
  }
}

const composite_stats_str = (stats, stat_id) => {
  switch (stat_id) {
    case 3: // AVG: H/AB
      return `${stats[8]}/${stats[6]}`;
    case 4: // OBP: (H+BB+HBP)/(AB+BB+HBP+SF)
      return `(${stats[8]}+${stats[18]}+${stats[20]})/(${stats[6]}+${stats[18]}+${stats[20]}+${stats[15]})`;
    case 5: // SLG: TB/AB
      return `${stats[23]}/${stats[6]}`;
    case 26: // ERA: ER/OUTS*27
      return `${stats[37]}/${stats[33]}*27`;
    case 27: // WHIP: (H+BB)/OUTS*3
      return `(${stats[34]}+${stats[39]})/${stats[33]}*3`;
    case 50: // IP: OUTS/3
      return `${stats[33]}/3`;
    case 54: // FPCT: (PO+A)/(PO+A+E)
      return `(${stats[51]}+${stats[52]})/(${stats[51]}+${stats[52]}+${stats[53]})`;
    case 55: // OPS: (H+BB+HBP)/(AB+BB+HBP+SF) + TB/AB
      return `(${stats[8]}+${stats[18]}+${stats[20]})/(${stats[6]}+${stats[18]}+${stats[20]}+${stats[15]}) + ${stats[23]}/${stats[6]}`;
    case 56: // K/BB: K/BB
      return `${stats[42]}/${stats[39]}`;
    case 57: // K/9: K/OUTS*27
      return `${stats[42]}/${stats[33]}*27`;
    case 60: // H/AB: H/AB
      return `${stats[8]}/${stats[6]}`;
    case 61: // XBH: 2B+3B+HR
      return `${stats[10]}+${stats[11]}+${stats[12]}`;
    case 62: // NSB: SB-CS
      return `${stats[16]}-${stats[17]}`;
    case 63: // SB%: SB/(SB+CS)
      return `${stats[16]}/(${stats[16]}+${stats[17]})`;
    case 65: // PA: AB+BB+HBP+SH+SF+CI
      return `${stats[6]}+${stats[18]}+${stats[20]}+${stats[14]}+${stats[15]}+${stats[88]}`;
    case 74: // OBPA: (H+BB+HBP)/TBF
      return `(${stats[34]}+${stats[39]}+${stats[41]})/${stats[35]}`;
    case 75: // WIN%: W/(W+L)
      return `${stats[28]}/(${stats[28]}+${stats[29]})`;
    case 76: // 1BA: H-2BA-3BA-HR
      return `${stats[34]}-${stats[68]}-${stats[69]}-${stats[38]}`;
    case 77: // H/9: H/OUTS*27
      return `${stats[34]}/${stats[33]}*27`;
    case 78: // BB/9: BB/OUTS*27
      return `${stats[39]}/${stats[33]}*27`;
    case 81: // SV%: SV/SVOP
      return `${stats[32]}/${stats[47]}`;
    case 84: // BSV: SVOP-SV
      return `${stats[47]}-${stats[32]}`;
    case 85: // NSV: SV*2-SVOP
      return `${stats[32]}*2-${stats[47]}`;
    case 89: // SV+H: SV+HLD
      return `${stats[32]}+${stats[48]}`;
    case 90: // NSVH: SV*2-SVOP+HLD
      return `${stats[32]}*2-${stats[47]}+${stats[48]}`;
    case 91: // NW: W-L
      return `${stats[28]}-${stats[29]}`;
    default:
      return `${stats[stat_id]}`;
  }
}

const composite_stats_value = (stats, stat_id) => {
  switch (stat_id) {
    case 3: // AVG: H/AB
      return stats[8]/stats[6];
    case 4: // OBP: (H+BB+HBP)/(AB+BB+HBP+SF)
      return (stats[8]+stats[18]+stats[20])/(stats[6]+stats[18]+stats[20]+stats[15]);
    case 5: // SLG: TB/AB
      return stats[23]/stats[6];
    case 26: // ERA: ER/OUTS*27
      return stats[37]/stats[33]*27;
    case 27: // WHIP: (H+BB)/OUTS*3
      return (stats[34]+stats[39])/stats[33]*3;
    case 50: // IP: OUTS/3
      return stats[33]/3;
    case 54: // FPCT: (PO+A)/(PO+A+E)
      return (stats[51]+stats[52])/(stats[51]+stats[52]+stats[53]);
    case 55: // OPS: (H+BB+HBP)/(AB+BB+HBP+SF) + TB/AB
      return (stats[8]+stats[18]+stats[20])/(stats[6]+stats[18]+stats[20]+stats[15]) + stats[23]/stats[6];
    case 56: // K/BB: K/BB
      return stats[42]/stats[39];
    case 57: // K/9: K/OUTS*27
      return stats[42]/stats[33]*27;
    case 60: // H/AB: H/AB
      return `${stats[8]}/${stats[6]}`;
    case 61: // XBH: 2B+3B+HR
      return stats[10]+stats[11]+stats[12];
    case 62: // NSB: SB-CS
      return stats[16]-stats[17];
    case 63: // SB%: SB/(SB+CS)
      return stats[16]/(stats[16]+stats[17]);
    case 65: // PA: AB+BB+HBP+SH+SF+CI
      return stats[6]+stats[18]+stats[20]+stats[14]+stats[15]+stats[88];
    case 74: // OBPA: (H+BB+HBP)/TBF
      return (stats[34]+stats[39]+stats[41])/stats[35];
    case 75: // WIN%: W/(W+L)
      return stats[28]/(stats[28]+stats[29]);
    case 76: // 1BA: H-2BA-3BA-HR
      return stats[34]-stats[68]-stats[69]-stats[38];
    case 77: // H/9: H/OUTS*27
      return stats[34]/stats[33]*27;
    case 78: // BB/9: BB/OUTS*27
      return stats[39]/stats[33]*27;
    case 81: // SV%: SV/SVOP
      return stats[32]/stats[47];
    case 84: // BSV: SVOP-SV
      return stats[47]-stats[32];
    case 85: // NSV: SV*2-SVOP
      return stats[32]*2-stats[47];
    case 89: // SV+H: SV+HLD
      return stats[32]+stats[48];
    case 90: // NSVH: SV*2-SVOP+HLD
      return stats[32]*2-stats[47]+stats[48];
    case 91: // NW: W-L
      return stats[28]-stats[29];
    default:
      return stats[stat_id];
  }
}

export { composite_stats, composite_stats_formula };

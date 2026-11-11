import { prisma } from './prisma';
import { getCached, setCached, invalidateCache } from './cache';

export type BankColor =
  | 'blue'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'emerald'
  | 'purple'
  | 'cyan'
  | 'slate';

export interface BankDriveFile {
  id: string;
  name: string;
  fileUrl: string;
  note?: string;
}

export interface BankFolder {
  id: string;
  bankName: string;
  slug: string;
  shortCode: string;
  color: BankColor;
  description: string;
  driveUrl: string;
  files: BankDriveFile[];
}

export const BANK_FOLDERS_CONFIG_KEY = 'bank_drive_folders';

export const DEFAULT_BANK_FOLDERS: BankFolder[] = [
  {
    id: 'bank-caixa',
    bankName: 'Caixa Econômica',
    slug: 'caixa',
    shortCode: 'CEF',
    color: 'blue',
    description: 'Formulários, checklists SBPE/MCMV, tabelas de tarifas, DPS e manuais PDF Caixa.',
    driveUrl: '',
    files: [],
  },
  {
    id: 'bank-itau',
    bankName: 'Itaú Unibanco',
    slug: 'itau',
    shortCode: 'ITAÚ',
    color: 'orange',
    description: 'Formulários de proposta, portabilidade, termo de vistoria e PDFs operacionais Itaú.',
    driveUrl: '',
    files: [],
  },
  {
    id: 'bank-santander',
    bankName: 'Santander',
    slug: 'santander',
    shortCode: 'SAN',
    color: 'red',
    description: 'Documentos, checklists de crédito imobiliário, declarações e guias PDF Santander.',
    driveUrl: '',
    files: [],
  },
  {
    id: 'bank-bb',
    bankName: 'Banco do Brasil',
    slug: 'banco-do-brasil',
    shortCode: 'BB',
    color: 'yellow',
    description: 'Roteiros, formulários de matrícula, renda e anexos em PDF do Banco do Brasil.',
    driveUrl: '',
    files: [],
  },
  {
    id: 'bank-bradesco',
    bankName: 'Bradesco',
    slug: 'bradesco',
    shortCode: 'BRA',
    color: 'purple',
    description: 'Manuais, fichas cadastrais, checklists e documentos em PDF Bradesco.',
    driveUrl: '',
    files: [],
  },
  {
    id: 'bank-inter',
    bankName: 'Banco Inter',
    slug: 'inter',
    shortCode: 'INT',
    color: 'emerald',
    description: 'PDFs de Home Equity, financiamento imobiliário e formulários Banco Inter.',
    driveUrl: '',
    files: [],
  },
  {
    id: 'bank-cashme',
    bankName: 'CashMe / Parceiros',
    slug: 'cashme',
    shortCode: 'CM',
    color: 'cyan',
    description: 'Materiais de Home Equity, garantia de imóvel e checklists de parceiros.',
    driveUrl: '',
    files: [],
  },
];

export function sanitizeBankFolders(raw: unknown): BankFolder[] {
  if (!Array.isArray(raw)) return DEFAULT_BANK_FOLDERS;

  return raw
    .filter((item): item is Record<string, any> => Boolean(item && typeof item === 'object'))
    .map((item, index) => {
      const bankName = String(item.bankName || `Banco ${index + 1}`).trim();
      const slug =
        String(item.slug || '')
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `banco-${index + 1}`;

      const allowedColors: BankColor[] = [
        'blue',
        'orange',
        'red',
        'yellow',
        'emerald',
        'purple',
        'cyan',
        'slate',
      ];
      const color: BankColor = allowedColors.includes(item.color) ? item.color : 'blue';

      const files: BankDriveFile[] = Array.isArray(item.files)
        ? item.files
            .filter(
              (f: any) => f && typeof f === 'object' && String(f.fileUrl || '').trim().length > 0
            )
            .map((f: any, fIdx: number) => ({
              id: String(f.id || `${slug}-file-${fIdx + 1}`),
              name: String(f.name || `Documento PDF ${fIdx + 1}`).trim(),
              fileUrl: String(f.fileUrl || '').trim(),
              note: f.note ? String(f.note).trim() : '',
            }))
        : [];

      return {
        id: String(item.id || `bank-${slug}-${index + 1}`),
        bankName,
        slug,
        shortCode:
          String(item.shortCode || bankName.slice(0, 3).toUpperCase())
            .trim()
            .slice(0, 6) || 'BNC',
        color,
        description: String(item.description || '').trim(),
        driveUrl: String(item.driveUrl || '').trim(),
        files,
      };
    });
}

export async function getBankFolders(): Promise<BankFolder[]> {
  const cached = getCached<BankFolder[]>('bank-folders:list', 120000);
  if (cached) return cached;

  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: BANK_FOLDERS_CONFIG_KEY },
    });

    if (!config || !config.value) {
      setCached('bank-folders:list', DEFAULT_BANK_FOLDERS);
      return DEFAULT_BANK_FOLDERS;
    }

    const parsed = JSON.parse(config.value);
    const folders = sanitizeBankFolders(parsed);
    setCached('bank-folders:list', folders);
    return folders;
  } catch (error) {
    console.error('Erro ao carregar pastas dos bancos:', error);
    return DEFAULT_BANK_FOLDERS;
  }
}

export async function saveBankFolders(folders: BankFolder[]): Promise<BankFolder[]> {
  const clean = sanitizeBankFolders(folders);

  await prisma.systemConfig.upsert({
    where: { key: BANK_FOLDERS_CONFIG_KEY },
    update: { value: JSON.stringify(clean) },
    create: {
      key: BANK_FOLDERS_CONFIG_KEY,
      value: JSON.stringify(clean),
    },
  });

  invalidateCache('bank-folders');
  return clean;
}

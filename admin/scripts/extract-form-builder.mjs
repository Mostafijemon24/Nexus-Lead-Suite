/**
 * Extracts Form Builder UI from the reference beautified bundle (matches Downloads release).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const refPath = path.join( __dirname, '../src/.reference/main.beautified.js' );
const outPath = path.join( __dirname, '../src/form-builder/core.js' );

const lines = fs.readFileSync( refPath, 'utf8' ).split( '\n' );
// 1-indexed lines 12691–15116 in reference bundle.
const chunk = lines.slice( 12690, 15116 ).join( '\n' );

const header = `/* eslint-disable */
/**
 * Form Builder core — extracted from reference bundle (Downloads release design).
 * Uses React.createElement (s.jsx) to avoid lossy JSX conversion.
 */
import React from 'react';
import {
	User,
	Mail,
	Type,
	MessageSquare,
	ChevronDown,
	Radio,
	SquareCheckBig,
	Phone,
	MapPin,
	Calendar,
	Lock,
	Link,
	Hash,
	Upload,
	LayoutList,
	List,
	ListPlus,
	ListX,
	Shield,
	Cloud,
	ArrowRight,
	X,
	GripVertical,
	Plus,
	Search,
	Eye,
	EyeOff,
	Clipboard,
	Copy,
	Trash2,
} from 'lucide-react';

const s = { jsx: React.createElement, jsxs: React.createElement, Fragment: React.Fragment };
const w = React;

const hr = User;
const It = Mail;
const xr = Type;
const dr = MessageSquare;
const or = ChevronDown;
const Cx = Radio;
const Ec = SquareCheckBig;
const pr = Phone;
const Xs = MapPin;
const jn = Calendar;
const op = Lock;
const ip = Link;
const co = Hash;
const Hn = Upload;
const ex = LayoutList;
const cx = List;
const rx = ListPlus;
const ix = ListX;
const Dx = Shield;
const Mm = Cloud;
const oi = ArrowRight;
const Je = X;
const Km = GripVertical;
const wt = Plus;
const up = Search;
const ym = AtSign;
const nx = Link2;
const Ut = Eye;
const EyeOffIcon = EyeOff;
const Lm = Clipboard;
const oo = Copy;
const rs = Trash2;

`;

let body = chunk
	.replace( /^const vh = \(e = 1\) => \(\{/m, 'function createDefaultFieldSettings( e = 1 ) {\n\treturn {' )
	.replace( /^\s*columnSpan: e\s*\n\s*\}\),\s*\n\s*hp = \[/m, '\t\tcolumnSpan: e\n\t};\n}\n\nconst FIELD_CATALOG = [' )
	.replace( /\bvh\(/g, 'createDefaultFieldSettings(' )
	.replace( /\bhp\b/g, 'FIELD_CATALOG' )
	.replace( /^function zh\(/m, 'export function DynamicFieldsBuilder(' )
	.replace( /^function Lh\(/m, 'export function FieldSettingsInline(' )
	.replace( /^function Fh\(/m, 'export function FormPreviewModal(' )
	.replace( /\$m/g, 'EyeOffIcon' );

fs.writeFileSync( outPath, header + body );
console.log( 'Wrote', outPath, '(', ( header + body ).split( '\n' ).length, 'lines )' );

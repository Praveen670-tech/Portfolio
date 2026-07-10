#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const outputJsonFile = path.join(projectRoot, 'assets', 'certificates', 'certificates.json');
const outputJsFile = path.join(projectRoot, 'assets', 'certificates', 'certificates-data.js');
const supportedExtensions = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp']);

function walkDirectory(dirPath, results = []) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    entries.forEach((entry) => {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.git') return;
            walkDirectory(fullPath, results);
            return;
        }
        results.push(fullPath);
    });
    return results;
}

function toDisplayName(filePath) {
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext)
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!base) return 'Certificate';

    return base
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .replace(/\bPdf\b/gi, 'PDF')
        .replace(/\bPng\b/gi, 'PNG')
        .replace(/\bJpeg\b/gi, 'JPEG')
        .replace(/\bWebp\b/gi, 'WEBP');
}

function inferOrganization(title) {
    const normalized = title.toLowerCase();
    if (/cisco|networking|python essentials|it support|packet tracer|skills for all/.test(normalized)) {
        return 'Cisco Networking Academy';
    }
    return 'Verified Certificate';
}

function inferDescription(title, organization) {
    if (organization === 'Cisco Networking Academy') {
        return `Verified learning experience covering ${title.toLowerCase()} with hands-on practice and industry-aligned concepts.`;
    }
    return `Verified certificate recognizing professional learning and achievement in ${title.toLowerCase()}.`;
}

function isCertificateFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (!supportedExtensions.has(ext)) return false;

    const relativePath = path.relative(projectRoot, filePath).split(path.sep).join('/');
    const parts = relativePath.toLowerCase().split('/');
    const fileName = path.basename(filePath).toLowerCase();

    const inCertificateFolder = parts.some((part) => part === 'certificate' || part === 'certificates');
    const looksLikeCertificate = /(certificate|certification|badge|skills for all|python|network|essentials|support|packet|cisco|academy|iot|design thinking|cloud foundations)/i.test(fileName);

    return inCertificateFolder || looksLikeCertificate;
}

const files = walkDirectory(projectRoot)
    .filter(isCertificateFile)
    .sort((a, b) => a.localeCompare(b));

const manifest = files.map((filePath) => {
    const relativePath = path.relative(projectRoot, filePath).split(path.sep).join('/');
    const ext = path.extname(filePath).toLowerCase();
    const title = toDisplayName(filePath);
    const organization = inferOrganization(title);

    return {
        title,
        description: inferDescription(title, organization),
        file: relativePath,
        type: ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? 'image' : 'pdf',
        organization,
    };
});

fs.mkdirSync(path.dirname(outputJsonFile), { recursive: true });
fs.writeFileSync(outputJsonFile, `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(outputJsFile, `window.CERTIFICATE_DATA = ${JSON.stringify(manifest, null, 2)};\n`);
console.log(`Generated ${manifest.length} certificate entries in ${path.relative(projectRoot, outputJsonFile)} and ${path.relative(projectRoot, outputJsFile)}`);

# Οδηγός Συλλογής Δεδομένων Συνταγματικότητας
# Constitutional Data Collection Guide

> **Target audience:** AI scraping agent / data entry operator
> **Purpose:** For every `event` in a minister's JSON file, do two things:
> 1. **Research** whether constitutionality fields apply and fill them in accurately with cited sources.
> 2. **Assess independently** whether the action was constitutional or not, based on the text of the Greek Constitution — regardless of what any court has ruled. Record this in `my_constitutional_assessment`.

---

## 1. Πότε να συμπληρωθεί το πεδίο constitutionality

Η συνταγματικότητα καταγράφεται **μόνο** για γεγονότα αυτού του είδους:

| Τύπος γεγονότος (`type`) | Πότε αφορά συνταγματικότητα |
|---|---|
| `vote` | Κάθε νόμος/πράξη που ψηφίστηκε στη Βουλή |
| `legal` | Δικαστικές αποφάσεις, εισαγγελικές παραπομπές |
| `scandal` | Αν αφορά κατάχρηση εξουσίας, παράνομη παρακολούθηση |
| `appointment` | Αν ο διορισμός ή πράξη αμφισβητήθηκε νομικά |
| `statement` | Εξαιρετικά σπάνια — μόνο αν οδήγησε σε νομική διαμάχη |
| `achievement` | Σπάνια — μόνο αν το επίτευγμα αμφισβητήθηκε νομικά |
| `financial` | Αν αφορά παράνομη χρηματοδότηση, ΦΕΚ παραβάσεις |
| `media` | Σχεδόν ποτέ |

**Αν δεν υπάρχει συνταγματική διάσταση, άφησε το πεδίο `constitutionality` κενό (`null`).**

---

## 2. Enum τιμές για `constitutionality`

```
constitutional       → Κρίθηκε/θεωρείται συνταγματικό από αρμόδιο φορέα
unconstitutional     → Κρίθηκε αντισυνταγματικό από δικαστήριο ή ανεξάρτητη αρχή
disputed             → Αμφισβητείται ενεργά — αντικρουόμενες νομικές γνώμες
pending_ruling       → Εκκρεμεί απόφαση (Συμβούλιο Επικρατείας, Ελεγκτικό Συνέδριο κ.λπ.)
not_applicable       → Το γεγονός δεν έχει συνταγματική διάσταση
```

**Κανόνας πρώτης επιλογής:**
- Επίσημη απόφαση ΣτΕ/Αρείου Πάγου/Ελεγκτικού Συνεδρίου: `constitutional` ή `unconstitutional`
- Ακαδημαϊκές/πολιτικές διαφωνίες χωρίς απόφαση: `disputed`
- Αιτήσεις/αναφορές εκκρεμείς: `pending_ruling`
- Τίποτα από τα παραπάνω: `not_applicable` ή κενό

---

## 3. Enum τιμές για `constitutional_ruling_outcome`

Συμπληρώνεται **μόνο** αν υπάρχει επίσημη απόφαση δικαστηρίου:

```
upheld      → Το μέτρο κρίθηκε συνταγματικό (επικυρώθηκε)
struck_down → Το μέτρο κρίθηκε αντισυνταγματικό (ακυρώθηκε)
referred    → Παραπέμφθηκε σε ανώτερο δικαστήριο ή ΕΔΔΑ
pending     → Η αίτηση εκκρεμεί
```

---

## 4. Στρατηγική αναζήτησης

Για κάθε γεγονός, ξεκίνα με ευρεία αναζήτηση και στένεψε σταδιακά μέχρι να βρεις αξιόπιστες πληροφορίες. Δεν υπάρχει σταθερή λίστα πηγών — ψάξε σε όσες πηγές χρειαστεί.

**Ερωτήματα αναζήτησης για να ξεκινήσεις:**
- `[τίτλος νόμου ή θέμα] αντισυνταγματικό`
- `[τίτλος νόμου] Συμβούλιο Επικρατείας απόφαση`
- `[τίτλος νόμου] unconstitutional Greece`
- `[τίτλος νόμου] ECHR ruling`
- `[αριθμός ΦΕΚ ή νόμου] συνταγματικότητα`

**Τύποι πηγών που αξίζει να αναζητήσεις (χωρίς περιορισμό σε συγκεκριμένες):**
- Επίσημες αποφάσεις ανώτατων δικαστηρίων (ΣτΕ, Άρειος Πάγος, Ελεγκτικό Συνέδριο, ΕΔΔΑ)
- Επίσημα έγγραφα της Βουλής, σχέδια νόμου, πρακτικά
- Εθνικά νομοθετικά αρχεία και ΦΕΚ
- Ακαδημαϊκά νομικά άρθρα και γνωμοδοτήσεις
- Αξιόπιστες εφημερίδες και ειδησεογραφικές πηγές που τεκμηριώνουν αποφάσεις
- Εγκυκλοπαιδικές πηγές για γεγονότα που έχουν τεκμηριωθεί
- Ανεξάρτητες αρχές (π.χ. ΑΠΔΠΧ, Συνήγορος του Πολίτη)

**Συνέχισε να ψάχνεις μέχρι:** να επιβεβαιώσεις ή να αποκλείσεις την ύπαρξη επίσημης απόφασης, ή μέχρι να συμπεράνεις τεκμηριωμένα ότι δεν υπάρχει συνταγματική διάσταση.

---

## 5. Δομή JSON για γεγονότα με constitutional fields

### Βασική δομή γεγονότος (χωρίς constitutional)

```json
{
  "id": "slug-περιγραφικο-ονομα",
  "type": "vote",
  "date": "YYYY-MM-DD",
  "title": "Τίτλος στα ελληνικά",
  "title_en": "Title in English",
  "description": "Περιγραφή στα ελληνικά.",
  "description_en": "Description in English.",
  "severity": "low | medium | high",
  "resolution": "resolved | ongoing | pending | dismissed",
  "outcome": "passed | rejected | abstained",
  "sources": [
    {
      "label": "Πηγή (π.χ. Wikipedia, ΦΕΚ, Βουλή.gr)",
      "url": "https://..."
    }
  ]
}
```

### Δομή γεγονότος ΜΕ constitutional fields

```json
{
  "id": "slug-περιγραφικο-ονομα",
  "type": "vote",
  "date": "YYYY-MM-DD",
  "title": "Τίτλος στα ελληνικά",
  "title_en": "Title in English",
  "description": "Περιγραφή στα ελληνικά.",
  "description_en": "Description in English.",
  "severity": "low | medium | high",
  "resolution": "resolved | ongoing | pending | dismissed",
  "outcome": "passed | rejected | abstained",

  "constitutionality": "constitutional | unconstitutional | disputed | pending_ruling | not_applicable",
  "constitutional_notes": "Ελεύθερο κείμενο που εξηγεί τη συνταγματική διάσταση. Ποια άρθρα αφορά, ποιος αμφισβήτησε, ποιο δικαστήριο αποφάνθηκε.",
  "constitutional_court_ruling": "π.χ. ΣτΕ 1234/2021 ή ΕΔΔΑ Mitsotakis v. Greece 2023",
  "constitutional_ruling_outcome": "upheld | struck_down | referred | pending",

  "constitutional_references": [
    {
      "article": "Άρθρο 14 παρ. 1",
      "constitution_year": 1975,
      "description": "Ελευθερία του Τύπου",
      "source": "https://www.hellenicparliament.gr/UserFiles/8c983922.../SYN-withESR.pdf"
    },
    {
      "article": "Άρθρο 9 παρ. 1",
      "constitution_year": 1975,
      "description": "Απόρρητο communications",
      "source": null
    }
  ],

  "sources": [
    {
      "label": "ΣτΕ απόφαση 1234/2021",
      "url": "https://www.ste.gr/..."
    },
    {
      "label": "ΦΕΚ Α' 123/2021",
      "url": "https://www.et.gr/..."
    }
  ]
}
```

---

## 6. Παραδείγματα ανά κατηγορία

### 6.1 `unconstitutional` — Νόμος που ακυρώθηκε από ΣτΕ

```json
{
  "id": "nomos-123-akyrothike-ste",
  "type": "vote",
  "date": "2020-05-10",
  "title": "Νόμος για Μείωση Συντάξεων",
  "title_en": "Pension Reduction Law",
  "description": "Νόμος που μείωσε τις κύριες συντάξεις κατά 15%.",
  "description_en": "Law reducing main pensions by 15%.",
  "severity": "high",
  "resolution": "resolved",
  "outcome": "passed",
  "constitutionality": "unconstitutional",
  "constitutional_notes": "Το ΣτΕ με απόφαση Ολομ. 2192/2020 έκρινε ότι η μείωση παραβιάζει το άρθρο 22 παρ. 5 του Συντάγματος (δικαίωμα κοινωνικής ασφάλισης). Ο νόμος εφαρμόστηκε αντισυνταγματικά για 18 μήνες.",
  "constitutional_court_ruling": "ΣτΕ Ολ. 2192/2020",
  "constitutional_ruling_outcome": "struck_down",
  "constitutional_references": [
    {
      "article": "Άρθρο 22 παρ. 5",
      "constitution_year": 1975,
      "description": "Δικαίωμα κοινωνικής ασφάλισης",
      "source": null
    }
  ],
  "sources": [
    {
      "label": "ΣτΕ Ολ. 2192/2020",
      "url": "https://www.ste.gr/el/decisions/2192-2020"
    }
  ]
}
```

### 6.2 `disputed` — Αμφισβητούμενο μέτρο χωρίς τελική απόφαση

```json
{
  "id": "nomos-parakolutheiseis-2021",
  "type": "vote",
  "date": "2021-03-15",
  "title": "Νόμος Εθνικής Ασφάλειας — Επέκταση Παρακολουθήσεων",
  "title_en": "National Security Law — Surveillance Expansion",
  "description": "Νόμος που επέτρεψε στην ΕΥΠ να λαμβάνει δεδομένα χωρίς δικαστική εντολή υπό ορισμένες προϋποθέσεις.",
  "description_en": "Law allowing EYP to access data without court order under certain conditions.",
  "severity": "high",
  "resolution": "ongoing",
  "outcome": "passed",
  "constitutionality": "disputed",
  "constitutional_notes": "Νομικοί μελετητές και η Αρχή Προστασίας Δεδομένων (ΑΠΔΠΧ) εξέφρασαν σοβαρές αμφιβολίες για την προσβολή του άρθρου 9Α (προσωπικά δεδομένα) και 19 (απόρρητο επικοινωνιών). Εκκρεμούν προσφυγές στο ΣτΕ.",
  "constitutional_court_ruling": null,
  "constitutional_ruling_outcome": "pending",
  "constitutional_references": [
    {
      "article": "Άρθρο 9Α",
      "constitution_year": 1975,
      "description": "Προστασία προσωπικών δεδομένων",
      "source": null
    },
    {
      "article": "Άρθρο 19",
      "constitution_year": 1975,
      "description": "Απόρρητο επικοινωνιών",
      "source": null
    }
  ],
  "sources": [
    {
      "label": "ΑΠΔΠΧ γνωμοδότηση 2021",
      "url": "https://www.dpa.gr/..."
    }
  ]
}
```

### 6.3 `constitutional` — Μέτρο που επικυρώθηκε ρητά

```json
{
  "id": "nomos-covid-apagoreusi-2020",
  "type": "vote",
  "date": "2020-03-20",
  "title": "Μέτρα Lockdown COVID-19",
  "title_en": "COVID-19 Lockdown Measures",
  "description": "Προεδρικό Διάταγμα που επέβαλε κινητικούς περιορισμούς λόγω πανδημίας.",
  "description_en": "Presidential Decree imposing movement restrictions due to pandemic.",
  "severity": "high",
  "resolution": "resolved",
  "constitutionality": "constitutional",
  "constitutional_notes": "Το ΣτΕ με την Ολ. 1/2022 επιβεβαίωσε ότι τα μέτρα ήταν συνταγματικά βάσει του άρθρου 5 παρ. 3 (προστασία υγείας) και άρθρου 25 παρ. 4 (κοινωνική αλληλεγγύη) σε κατάσταση έκτακτης ανάγκης.",
  "constitutional_court_ruling": "ΣτΕ Ολ. 1/2022",
  "constitutional_ruling_outcome": "upheld",
  "constitutional_references": [
    {
      "article": "Άρθρο 5 παρ. 3",
      "constitution_year": 1975,
      "description": "Δικαίωμα στην υγεία",
      "source": null
    },
    {
      "article": "Άρθρο 25 παρ. 4",
      "constitution_year": 1975,
      "description": "Αρχή κοινωνικής αλληλεγγύης",
      "source": null
    }
  ],
  "sources": [
    {
      "label": "ΣτΕ Ολ. 1/2022",
      "url": "https://www.ste.gr/..."
    }
  ]
}
```

### 6.4 `pending_ruling` — Εκκρεμεί απόφαση

```json
{
  "id": "nomos-idiotikes-panepistimiakes-2024",
  "type": "vote",
  "date": "2024-05-30",
  "title": "Εισαγωγή Ιδιωτικών Πανεπιστημίων",
  "title_en": "Introduction of Private Universities",
  "description": "Νόμος που επέτρεψε την ίδρυση μη κρατικών μη κερδοσκοπικών ΑΕΙ.",
  "description_en": "Law permitting establishment of non-state, non-profit universities.",
  "severity": "high",
  "resolution": "ongoing",
  "outcome": "passed",
  "constitutionality": "pending_ruling",
  "constitutional_notes": "Συνταγματολόγοι αμφισβητούν τη συμβατότητα με το άρθρο 16 παρ. 5 που προβλέπει αποκλειστικά κρατική ανώτατη εκπαίδευση. Κατατέθηκαν αιτήσεις ακυρώσεως στο ΣτΕ. Η υπόθεση επρόκειτο να συζητηθεί εντός 2025.",
  "constitutional_court_ruling": "Εκκρεμεί — ΣτΕ 2025",
  "constitutional_ruling_outcome": "pending",
  "constitutional_references": [
    {
      "article": "Άρθρο 16 παρ. 5",
      "constitution_year": 1975,
      "description": "Αποκλειστικά κρατική ανώτατη εκπαίδευση",
      "source": "https://www.hellenicparliament.gr/UserFiles/..."
    }
  ],
  "sources": [
    {
      "label": "ΦΕΚ Α' 112/2024",
      "url": "https://www.et.gr/..."
    },
    {
      "label": "Εφημερίδα Καθημερινή — Αιτήσεις ακύρωσης",
      "url": "https://www.kathimerini.gr/..."
    }
  ]
}
```

---

## 7. Βασικά Άρθρα Ελληνικού Συντάγματος 1975 (ως αναθεωρήθηκε)

Αξιοποίησε αυτά ως αφετηρία όταν χρειαστεί να συμπληρώσεις `constitutional_references`:

| Άρθρο | Περιεχόμενο |
|---|---|
| Άρθρο 2 | Αξία ανθρώπου |
| Άρθρο 4 | Ισότητα πολιτών |
| Άρθρο 5 | Ελεύθερη ανάπτυξη προσωπικότητας, δικαίωμα στη ζωή |
| Άρθρο 5Α | Πρόσβαση στην πληροφορία |
| Άρθρο 9 | Απαραβίαστο της κατοικίας |
| Άρθρο 9Α | Προστασία προσωπικών δεδομένων |
| Άρθρο 10 | Δικαίωμα αναφοράς/αίτησης |
| Άρθρο 11 | Ελευθερία συνάθροισης |
| Άρθρο 12 | Ελευθερία συνεταιρισμού |
| Άρθρο 13 | Ελευθερία θρησκείας |
| Άρθρο 14 | Ελευθερία τύπου |
| Άρθρο 16 | Παιδεία — κρατικό μονοπώλιο ΑΕΙ |
| Άρθρο 17 | Δικαίωμα στην ιδιοκτησία |
| Άρθρο 19 | Απόρρητο επικοινωνιών |
| Άρθρο 20 | Δικαίωμα δικαστικής προστασίας |
| Άρθρο 21 | Προστασία οικογένειας |
| Άρθρο 22 | Δικαίωμα εργασίας, κοινωνική ασφάλιση |
| Άρθρο 24 | Περιβάλλον |
| Άρθρο 26 | Αρχή διάκρισης εξουσιών |
| Άρθρο 35 | Υπουργική ευθύνη / προσυπογραφή |
| Άρθρο 36 | Πράξεις Νομοθετικού Περιεχομένου |
| Άρθρο 44 | Νομοθετική εξουσιοδότηση |
| Άρθρο 80 | Προϋπολογισμός |
| Άρθρο 87 | Ανεξαρτησία δικαστικής εξουσίας |
| Άρθρο 93 | Αιτιολόγηση δικαστικών αποφάσεων |
| Άρθρο 100 | Ανώτατο Ειδικό Δικαστήριο |

---

## 8. Σχόλια για τον Agent / Scraper

### Τι να ψάχνεις για κάθε event

Ψάξε ευρέως — μην περιορίζεσαι σε συγκεκριμένες πηγές. Στόχος είναι να καλύψεις το ερώτημα «υπάρχει επίσημη απόφαση ή νομική αμφισβήτηση;» πριν καταλήξεις σε οποιοδήποτε `constitutionality` enum.

```
1. Ξεκίνα με ευρεία αναζήτηση: [τίτλος γεγονότος] + συνταγματικό / αντισυνταγματικό / unconstitutional
2. Αναζήτησε για επίσημες αποφάσεις: [θέμα] + δικαστήριο / court ruling / ΣτΕ / ΕΔΔΑ / ECHR
3. Αν αφορά ανθρώπινα δικαιώματα, ψάξε και σε ευρωπαϊκές/διεθνείς νομικές βάσεις
4. Ψάξε νομικά σχόλια και ακαδημαϊκές γνώμες αν δεν βρίσκεις επίσημη απόφαση
5. Συνέχισε μέχρι να έχεις τεκμηριωμένη απάντηση — μην σταματάς στην πρώτη πηγή
```

### Κανόνες ποιότητας — πεδία έρευνας

- **Ποτέ μη γράφεις** `constitutionality: "unconstitutional"` βασισμένος μόνο σε πολιτική κριτική
- Το `constitutional_court_ruling` πρέπει να είναι **αριθμός απόφασης** (όχι απλώς "ΣτΕ")
- Τα `constitutional_references` πρέπει να αναφέρουν **συγκεκριμένες παραγράφους** όταν είναι γνωστές
- Το `constitutional_notes` γράφεις στα **ελληνικά** — ελεύθερο κείμενο, 1–5 προτάσεις
- Αν δεν βρίσκεις τίποτα, **μην συμπληρώνεις το πεδίο** (αφησέ το null) — προτιμάται κενό από λάθος

---

### Ανεξάρτητη συνταγματική εκτίμηση (`my_constitutional_assessment`)

Πέρα από την καταγραφή τι αποφάσισαν τα δικαστήρια, ο agent **οφείλει να διαμορφώσει δική του εκτίμηση** για το αν η πράξη/νόμος ήταν συνταγματικός ή όχι, βασισμένη αποκλειστικά στο κείμενο του Συντάγματος.

**Βασικές αρχές:**
- Η εκτίμηση είναι **ανεξάρτητη** από κάθε δικαστική απόφαση — ακόμα και αν ο ΣτΕ έκρινε κάτι συνταγματικό, ο agent μπορεί να διαφωνεί και το αντίστροφο
- Βασίζεται **αποκλειστικά στο κείμενο του Συντάγματος** και στη νομική λογική, όχι σε πολιτικές κρίσεις
- Αναφέρει ποια **συγκεκριμένα άρθρα** θίγονται και γιατί
- Είναι γραμμένη στα **Ελληνικά**, 2–6 προτάσεις
- Αν η πράξη δεν έχει συνταγματική διάσταση, το πεδίο μένει `null`

**Πώς να σκεφτείς:**
1. Εντόπισε ποια συνταγματικά δικαιώματα ή αρχές αγγίζει η πράξη (βλ. πίνακα άρθρων §7)
2. Εξέτασε αν η πράξη παραβιάζει τα γράμματα ή το πνεύμα αυτών των άρθρων
3. Έλεγξε αν υπάρχει ρητή εξουσιοδότηση στο Σύνταγμα για τέτοια πράξη
4. Συνυπολόγισε αν η πράξη είναι αναλογική και αναγκαία (αρχή αναλογικότητας, άρθρο 25)
5. Διατύπωσε την εκτίμησή σου με σαφήνεια, αναφέροντας τα άρθρα

**Παράδειγμα:**
```
"my_constitutional_assessment": "Η διάταξη φαίνεται να αντίκειται στο άρθρο 9Α του Συντάγματος που κατοχυρώνει την προστασία προσωπικών δεδομένων, καθώς επιτρέπει πρόσβαση σε επικοινωνίες χωρίς προηγούμενη δικαστική εντολή. Η απουσία δικαστικού ελέγχου προ της επέμβασης παραβιάζει επίσης το άρθρο 19. Ακόμα κι αν θεωρηθεί ότι εξυπηρετεί σκοπό δημόσιου συμφέροντος, το μέτρο δεν πληροί την αρχή αναλογικότητας (άρθρο 25 παρ. 1)."
```

### Template αιτήματος για AI agent

Για να ζητήσεις από AI να συμπληρώσει τα constitutional fields ενός event:

```
Αναλυτικά το ακόλουθο γεγονός:

Τίτλος: [TITLE]
Ημερομηνία: [DATE]
Περιγραφή: [DESCRIPTION]

Α. Έρευνα (factual):
Ερεύνησε αν υπάρχουν επίσημες αποφάσεις ή νομικές αμφισβητήσεις.
Ψάξε ευρέως — δικαστήρια, ακαδημαϊκές πηγές, ανεξάρτητες αρχές, ειδησεογραφικές πηγές.
Συνέχισε μέχρι να έχεις τεκμηριωμένη απάντηση.

Β. Ανεξάρτητη εκτίμηση (σου ζητείται η γνώμη σου):
Βασισμένος ΑΠΟΚΛΕΙΣΤΙΚΑ στο κείμενο του Ελληνικού Συντάγματος (1975, ως αναθεωρήθηκε),
αξιολόγησε αν η συγκεκριμένη πράξη/νόμος ήταν συνταγματική ή όχι.
Αγνόησε τι αποφάσισαν τα δικαστήρια — εκτίμησε εσύ.
Αναφέρου σε συγκεκριμένα άρθρα.

Επίστρεψε JSON με τα ακόλουθα πεδία:
- constitutionality (constitutional/unconstitutional/disputed/pending_ruling/not_applicable)
- constitutional_notes (ελληνικά, 1-5 προτάσεις — περιγραφή της νομικής διάστασης)
- constitutional_court_ruling (αριθμός επίσημης απόφασης ή null)
- constitutional_ruling_outcome (upheld/struck_down/referred/pending ή null)
- constitutional_references (array: article, constitution_year, description, source)
- my_constitutional_assessment (ελληνικά, 2-6 προτάσεις — η δική σου εκτίμηση βάσει Συντάγματος, ή null αν δεν έχει συνταγματική διάσταση)
```

---

## 9. Πλήρης δομή JSON minister file (σχετικές ενότητες)

```json
{
  "id": "slug-ονομα-υπουργου",
  "name": "Ονοματεπώνυμο",
  "name_en": "Full Name in English",
  ...

  "events": [
    {
      "id": "μοναδικό-slug",
      "type": "vote | scandal | legal | statement | achievement | appointment | financial | media",
      "date": "YYYY-MM-DD",
      "title": "Τίτλος ελληνικά",
      "title_en": "Title in English",
      "description": "Περιγραφή ελληνικά",
      "description_en": "Description in English",
      "severity": "low | medium | high",
      "resolution": "resolved | ongoing | pending | dismissed",
      "outcome": "passed | rejected | abstained",

      "constitutionality": "constitutional | unconstitutional | disputed | pending_ruling | not_applicable | null",
      "constitutional_notes": "Ελεύθερο κείμενο ελληνικά — null αν δεν αφορά",
      "constitutional_court_ruling": "π.χ. ΣτΕ Ολ. 1234/2020 — null αν δεν υπάρχει",
      "constitutional_ruling_outcome": "upheld | struck_down | referred | pending | null",

      "constitutional_references": [
        {
          "article": "Άρθρο ΧΧ παρ. Υ",
          "constitution_year": 1975,
          "description": "Περιεχόμενο άρθρου",
          "source": "URL ή null"
        }
      ],

      "sources": [
        {
          "label": "Ετικέτα πηγής",
          "url": "https://..."
        }
      ]
    }
  ]
}
```

---

## 10. Αντιστοίχηση JSON → Database (Prisma schema)

| JSON field | Database column | Model |
|---|---|---|
| `constitutionality` | `constitutionality` | `Event` (`Constitutionality` enum) |
| `constitutional_notes` | `constitutional_notes` | `Event` (Text) |
| `constitutional_court_ruling` | `constitutional_court_ruling` | `Event` (String) |
| `constitutional_ruling_outcome` | `constitutional_ruling_outcome` | `Event` (`ConstitutionalRulingOutcome` enum) |
| `constitutional_references[].article` | `article` | `ConstitutionalReference` |
| `constitutional_references[].constitution_year` | `constitution_year` | `ConstitutionalReference` (Int) |
| `constitutional_references[].description` | `description` | `ConstitutionalReference` (Text) |
| `constitutional_references[].source` | `source` | `ConstitutionalReference` (String?) |

**Import script path:** `scripts/import.ts` — handles the `constitutional_references` array automatically via nested upsert.

## Zu erwänende Inhalte (3 Minuten)

1. Wir entwickeln Archipel
2. Archipel: Dezentrale Archivierung und veröffenltichung von Inhalten
    - Inhalte: Audio, Video, Text, Bilder, Webseiten, ...
    - Dezentral: Kein zentraler Server. Jeder kann sein eigener Server sein. Stichwort Peer-to-Peer.
        - Es gibt keine Single-Points-of-Failure. Wenn ein Knoten im Netzwerk ausfällt ist das nicht so schlimm.
        - Nicht sehr relevant für große Unternehmen und andere mit Geld etc. Aber für kleine Projekte mit beschränkten mitteln und lebensdauer. Wenn das Projekt/der Blog/o.ä. nicht mehr weiter betrieben wird sind die Änderungen bei anderen Peers vorhanden.
    - Archivierung
        - Grundsätzlich ein FileStorage mit zusätzlicher Vermetadatung und Suche.
        - Archive zu spiegeln ist sehr leicht. Spiegel: die eigene kopie eines archivs entspricht immer dem original.
        - Änderungen können auch bidirektionale gespiegelt werden. Ergo gemeinsam an einem Archiv arbeiten.
    - Veröffentlichung
        - Es ist einfach möglich, eine Schnittstelle zwischen einer webseite oder einem blog und einem archiv zu erstellen, so dass die Archivierung und Veröffentlichung hand in hand geschehen.
    - Funktionsweise umreißen:
        - Wir bauen auf Dat auf, einem OpenSource toolset für p2p Datenstrukturen.
        - Die peers kommunizieren verschlüsselt. Es ist versioniert, append-only, vor nachträglichen veränderungen geschützt.
        - Diese Datenstrukturen kombinieren wir um Filesystem mit zusätzlichen Metadaten (und zukünftig Suchindices) zu erhalten.
        - Das ganze kann betrieben werden:
            - auf dem eigenen PC
            - auf einem kleinen mini storageServer im LAN
            - im Internet auf einem beliebigen Cloudserver
    - Wo stehen wir damit:
        - wir haben eine PROTOTYPEN (haha) und dieser kann:
            - geteilte Ordner wie bei Dropbox oder Nextcloud aber ohne Server
            - erste Ansätze zur Metadatenverwaltung.
            - Wiedergabe von Audio, Video, Bilder, Markdown, PDF
            - Gadgets: Wiki funktion und Youtube importer.

Es gibt einige rauhe Ecken, aber es funktioniert. Wir sind im regen Austausch mit potenziellen Nutzerinnen und der opensource/dat community. Wir sind aktiv dabei weitere Fördermittel einzuwerben, wer was weiß melde sich gerne: archipel@riseup.net archipel.xyz

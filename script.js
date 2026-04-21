const form = document.getElementById("search-form");
const input = document.getElementById("word-input");
const results = document.getElementById("results");

// event listener
form.addEventListener("submit", async(e) => {
    e.preventDefault();

    const word = input.value.trim();

    if (!word) {
        results.innerHTML = "<p>Please enter a word.</p>";
        return;
    }

    await fetchWord(word);

    // clear input after search
    input.value = "";
});

// Api fetch
async function fetchWord(word) {
    try {
        results.innerHTML = "<p>Loading...</p>";

        const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        );

        if (!response.ok) {
            throw new Error("Word not found");
        }

        const data = await response.json();

        parseData(data);

    } catch (error) {
        results.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}


// Give functionality to audio,synonyms and pronunciation
function parseData(data) {
    const entry = data[0];

    const word = entry.word;

    const definition =
        entry.meanings[0].definitions[0].definition;

    const pronunciation =
        entry.phonetic || "No pronunciation available";

    // AUDIO
    const audioUrl =
        entry.phonetics.find(p => p.audio)?.audio || "";

    // SYNONYMS
    let synonyms = [];

    entry.meanings.forEach(meaning => {
        meaning.synonyms?.forEach(s => synonyms.push(s));

        meaning.definitions.forEach(def => {
            def.synonyms?.forEach(s => synonyms.push(s));
        });
    });

    synonyms = [...new Set(synonyms)];

    if (synonyms.length === 0) {
        synonyms = ["No synonyms found"];
    }

    updateDOM(word, definition, pronunciation, synonyms, audioUrl);
}       


// DOM UPDATE
function updateDOM(word, definition, pronunciation, synonyms, audioUrl) {
    results.innerHTML = `
        <div class="result-box">
            <h2>${word.toUpperCase()}</h2>

            <p><strong>Pronunciation:</strong> ${pronunciation}</p>

            <p><strong>Definition:</strong> ${definition}</p>
            <p><strong>Synonyms:</strong> ${synonyms.join(", ")}</p>

            ${audioUrl ? `<button id="play-audio">🔊Press here to hear the pronunciation</button>` : ""}
        </div>
    `;   
    if (audioUrl) {
        const audio = new Audio(audioUrl);

        document.getElementById("play-audio").addEventListener("click", () => {
            audio.play();
        });
    }
}
<script>
  import Dropzone from "svelte-file-dropzone"
  import { _ } from "../i18n"
  import { loadFromFiles } from "../backends"

  // async function loadFromFiles(files) {
  //   console.log("Loading files: " + files.length);
  //   backends.map((backend) => {
  //     try {
  //     //   backend.loadDirectory(dir);
  //       console.log("Loaded with backend: " + backend.name);
  //     //   console.log(backend.events);
  //     //   addCalendarData(backend.name, backend.events);
  //     //   addOverviewData(backend.name, backend.events);
  //     } catch (err) {
  //       if (err != "Invalid directory") {
  //         console.error(err);
  //       }
  //     }
  //   });
  // }

  function handleFilesSelect(e) {
    const { acceptedFiles, fileRejections } = e.detail;
    const events = loadFromFiles(acceptedFiles);
    console.log(events);
  }
</script>

<style>
</style>

<Dropzone
  on:drop={handleFilesSelect}
  accept=""
  containerStyles="border-color:black">
  <p>Drag and drop files here, or click to select</p>
</Dropzone>

<h1>{$_('drop.header')}</h1>
<p>{$_('drop.description')}</p>

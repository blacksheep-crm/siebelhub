//BCRM OCI Adapter
//Example to connect to Oracle Cloud Infrastructure using OCI Java SDK
//PURELY EDUCATIONAL
//DO NOT USE IN MISSION-CRITICAL ENVIRONMENTS!!!!!
package com.bcrm.jbs;
import com.siebel.data.SiebelPropertySet;
import com.siebel.eai.SiebelBusinessServiceException;

import java.lang.System;
import java.util.UUID;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.HashMap;
import java.util.Date;
import java.util.Arrays;
import java.util.function.Supplier;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.Base64;
//import com.google.common.base.Supplier;

import com.oracle.bmc.ConfigFileReader;
import com.oracle.bmc.Region;
import com.oracle.bmc.auth.AuthenticationDetailsProvider;
import com.oracle.bmc.auth.ConfigFileAuthenticationDetailsProvider;
import com.oracle.bmc.auth.SimpleAuthenticationDetailsProvider;
import com.oracle.bmc.auth.StringPrivateKeySupplier;
import com.oracle.bmc.auth.SimplePrivateKeySupplier;
import com.oracle.bmc.model.BmcException;
import com.oracle.bmc.identity.IdentityClient;
import com.oracle.bmc.identity.requests.ListRegionsRequest;
import com.oracle.bmc.identity.responses.ListRegionsResponse;

//AI Vision
import com.oracle.bmc.aivision.AIServiceVisionClient;
import com.oracle.bmc.aivision.model.*;
import com.oracle.bmc.aivision.requests.*;
import com.oracle.bmc.aivision.responses.*;




public class BCRMOCIAdapter extends com.siebel.eai.SiebelBusinessService {    
    public void doInvokeMethod(String methodName, SiebelPropertySet input, SiebelPropertySet output) throws SiebelBusinessServiceException {
		try{
            if (methodName.equals("invokeoci")){
                String context = input.getProperty("Context");
                String configurationFilePath = input.getProperty("configurationFilePath");
                String profile = input.getProperty("profile");
                if (configurationFilePath == null || configurationFilePath.equals("")){
                    configurationFilePath = ".\\ociconfig";
                }
                if (profile == null || profile.equals("")){
                    profile = "DEFAULT";
                } 
           
                ConfigFileReader.ConfigFile config = getConfigFile(configurationFilePath, profile);
                AuthenticationDetailsProvider provider = getAuthenticationProvider(config);

                //dispatch
                if (context.equals("Identity.Regions")){
                    getRegions(config, provider, output);
                }
                if (context.equals("Vision.AnalyzeImage")){
                    analyzeImage(config, provider, input.getProperty("imgdata"), output);
                }
            }
            else{
                throw new SiebelBusinessServiceException("NO_SUCH_METHOD", "Unsupported method: " + methodName);
            }
        }
        catch (Exception e){
            output.setProperty("Error",e.toString());
        }
	}
    
    private ConfigFileReader.ConfigFile getConfigFile (String configurationFilePath, String profile) throws SiebelBusinessServiceException{
        try{
            ConfigFileReader.ConfigFile config = ConfigFileReader.parse(configurationFilePath, profile);
            return config;
        }
        catch (Exception e){
            throw new SiebelBusinessServiceException("Error in getConfigFile: ", e.toString());
        }
    }
    private AuthenticationDetailsProvider getAuthenticationProvider(ConfigFileReader.ConfigFile config) throws SiebelBusinessServiceException{
        try{
            AuthenticationDetailsProvider provider = new ConfigFileAuthenticationDetailsProvider(config);
            return provider;
        }
        catch (Exception e){
            throw new SiebelBusinessServiceException("Error in getAuthenticationProvider: ", e.toString());
        }
    }

    private void getRegions (ConfigFileReader.ConfigFile config, AuthenticationDetailsProvider provider, SiebelPropertySet output) throws SiebelBusinessServiceException{
        try{
            final IdentityClient identityClient = new IdentityClient(provider);
            identityClient.setRegion(config.get("region"));
            final ListRegionsResponse response = identityClient.listRegions(ListRegionsRequest.builder().build());
            List<com.oracle.bmc.identity.model.Region> regions = response.getItems();
            for (int i = 0; i < regions.size(); i++){
                output.setProperty("region" + i, regions.get(i).getName());
            }
        }
        catch (Exception e){
            throw new SiebelBusinessServiceException("Error in getRegions: ", e.toString());
        }
    }

    private void analyzeImage (ConfigFileReader.ConfigFile config, AuthenticationDetailsProvider provider, String imgdata, SiebelPropertySet output) {
      try{
        /* Create a service client */
        AIServiceVisionClient client = new AIServiceVisionClient(provider);
        String compartmentId = (config.get("compartmentid"));
        
        /*decode base64*/
        byte[] decodedBytes = Base64.getDecoder().decode(imgdata);
        
        /* Create a request and dependent object(s). */
	    AnalyzeImageDetails analyzeImageDetails = AnalyzeImageDetails.builder()
		    .features(new ArrayList<>(Arrays.asList(ImageClassificationFeature.builder().build())))
		    .image(InlineImageDetails.builder()
                .data(decodedBytes).build())
		    .compartmentId(compartmentId).build();

	    AnalyzeImageRequest analyzeImageRequest = AnalyzeImageRequest.builder()
		    .analyzeImageDetails(analyzeImageDetails)
		    .opcRequestId("1111111111").build();

        AnalyzeImageResponse response = client.analyzeImage(analyzeImageRequest);
        AnalyzeImageResult result = response.getAnalyzeImageResult();

        List<Label> lbls = result.getLabels();
        SiebelPropertySet lblps = new SiebelPropertySet();
        lblps.setType("labels");
        
        for (int i = 0; i < lbls.size(); i++){
                lblps.setProperty(lbls.get(i).getName(), lbls.get(i).getConfidence().toString());
        }

        output.addChild(lblps);
      }
      catch (Exception e){
          throw (e);
      }
    }   
}
